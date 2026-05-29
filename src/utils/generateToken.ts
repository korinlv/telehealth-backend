import jwt from 'jsonwebtoken';

const generateToken = (payload: {
  id: string;
  role: 'patient' | 'doctor';
  email: string;
}): string => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET as string,
    { expiresIn: '7d' }
  );
};

export default generateToken;