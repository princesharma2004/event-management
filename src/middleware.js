import { auth } from "@/auth";

export const runtime = "nodejs";

export default auth((req) => {
  // Optional: add custom logic here
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
