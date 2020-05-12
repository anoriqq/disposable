import { Request, Response } from 'express';
import { health } from '../../logics/health';

describe('health', () => {
  it('status 200 ok', () => {
    const req = {};
    const res = {
      sendStatus: jest.fn().mockReturnThis(),
    };

    health(req as Request, (res as unknown) as Response, () => {});

    expect(res.sendStatus.mock.calls[0][0]).toEqual(200);
  });
});
