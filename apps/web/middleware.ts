import middleware from "next-auth/middleware"

export default middleware

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/sub-accounts/:path*",
        "/agents/:path*",
        "/deployments/:path*",
        "/demos/:path*",
        "/settings/:path*",
    ],
}
