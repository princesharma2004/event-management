import Google from "next-auth/providers/google";
import clientPromise from "./lib/mongodb";

export default {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "login",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async profile({ profile }) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      };
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google") {
          const client = await clientPromise;
          const db = client.db("eventdb");
          const usersCollection = db.collection("users");

          // Check if user exists
          const existingUser = await usersCollection.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user for Google OAuth
            await usersCollection.insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: "google",
              createdAt: new Date(),
            });
          }
        }
        return true;
      } catch (error) {
        console.error("SignIn callback error:", error);
        return true; // Allow sign-in even if DB save fails
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        // Capture image from either 'image' (Credentials/DB) or 'picture' (Google)
        token.image = user.image || user.picture;
      }
      if (trigger === "update" && session) {
        const updateData = session.user || session;
        if (updateData.name) token.name = updateData.name;
        if (updateData.image) token.image = updateData.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.image;
      }
      return session;
    },
  },
};
