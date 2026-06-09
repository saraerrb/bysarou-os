import { cookies } from "next/headers";
import prisma from "./prisma";
import { getSession } from "./auth";

export async function getActiveStoreId() {
  const cookieStore = await cookies();
  const storeId = cookieStore.get("activeStoreId")?.value;
  
  if (storeId) return storeId;

  // If no cookie, get the first store the user has access to
  const session = await getSession();
  if (session) {
    const membership = await prisma.storeMember.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "asc" }
    });
    return membership?.storeId || null;
  }

  return null;
}

export async function setActiveStoreId(storeId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeStoreId", storeId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax"
  });
}

export async function getUserStores(userId: string) {
  return await prisma.store.findMany({
    where: {
      members: {
        some: { userId }
      }
    }
  });
}
