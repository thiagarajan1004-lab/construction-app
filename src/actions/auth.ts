"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export async function login(prevState: any, formData: FormData) {
    const mobile = formData.get("mobile") as string;
    const password = formData.get("password") as string;

    if (!mobile || !password) {
        return { error: "Please enter both mobile and password." };
    }

    const user = await prisma.user.findUnique({
        where: { mobile },
    });

    if (!user) {
        return { error: "Invalid mobile number or password." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { error: "Invalid mobile number or password." };
    }

    await createSession(user.id, user.role);
    redirect("/");
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get("name") as string;
    const mobile = formData.get("mobile") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !mobile || !password || !confirmPassword) {
        return { error: "All fields are required." };
    }

    if (password !== confirmPassword) {
        return { error: "Passwords do not match." };
    }

    const existingUser = await prisma.user.findUnique({
        where: { mobile },
    });

    if (existingUser) {
        return { error: "Mobile number already registered." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            name,
            mobile,
            password: hashedPassword,
            role: "user", // Default role
        },
    });

    await createSession(user.id, user.role);
    redirect("/");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
