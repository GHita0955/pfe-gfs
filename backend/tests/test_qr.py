import unittest

from utils.qr import build_reservation_qr_svg


class DummyReservation:
    def __init__(self):
        self.id = 42
        self.qr_token = 'demo-token'
        self.slot_id = 7


class QRGenerationTest(unittest.TestCase):
    def test_build_reservation_qr_svg_without_client_email_attr(self):
        reservation = DummyReservation()

        svg = build_reservation_qr_svg(reservation)

        self.assertIn('<svg', svg)
        self.assertIn('QR réservation', svg)
        self.assertIn('RESERVATION:42', svg)


if __name__ == '__main__':
    unittest.main()
