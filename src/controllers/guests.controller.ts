import type { Request, Response } from "express";
import { CreateGuestSchema } from "@/validators/guest.schema";
import * as GuestService from "@/services/GuestService";

export async function create(req: Request, res: Response): Promise<void> {
  const input = CreateGuestSchema.parse(req.body);
  const guest = await GuestService.createGuest(input);
  res.status(201).json(guest);
}
