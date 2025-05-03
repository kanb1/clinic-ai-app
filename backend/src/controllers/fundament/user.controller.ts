import { Request, Response } from 'express';
import { UserModel } from '../../models/user.model';

// Hent user info (for alle users in general)
export const getMyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId; // fra JWT payload

    const user = await UserModel.findById(userId).select('-password_hash'); // henter alt undtagen password_hash

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
