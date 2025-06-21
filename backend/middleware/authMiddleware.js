import jwt from "jsonwebtoken"

// Protect routes middleware
export const protect = async (req, res, next) => {
  let token

  // Check for token in cookies (your current approach)
  if (req.cookies.token) {
    try {
      token = req.cookies.token
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from the token - fix the property name
      req.user = { id: decoded.userId } // Make sure this matches your JWT payload

      next()
    } catch (error) {
      console.error("Token verification failed:", error)
      return res.status(401).json({
        success: false,
        message: "Not authorized, token failed",
      })
    }
  } else {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    })
  }
}
