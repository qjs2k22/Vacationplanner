import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButtonWithMenu } from "@/components/user-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth: Verify auth in layout (RESEARCH.md Pattern 1)
  // Note: This is secondary protection - middleware handles redirects
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Trip Coordinator
            </h1>
            <UserButtonWithMenu />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
