import { adminAuth } from "@/models/firebase/server"
import { NextApiRequest, NextApiResponse } from "next"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  if (req.method !== "GET") {
    res.status(405).json({
      error: {
        message: `Method ${req.method} Not Allowed`,
        statusCode: 405,
      },
    })
  }

  const address = req.query.address as string
  if (!address) {
    res.status(400).json({ debugMessage: `user address not found` })
  }

  const firebaseToken = await adminAuth.createCustomToken(address)

  res.status(200).json(firebaseToken)
}

export default handler