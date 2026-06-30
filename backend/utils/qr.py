import hashlib
from xml.sax.saxutils import escape


def build_reservation_qr_svg(reservation, size=260):
    """
    Génère un QR-like SVG unique et déterministe pour la confirmation.
    Le payload lisible reste dans le SVG pour validation côté accueil/admin.
    """
    client_email = getattr(reservation, 'client_email', None)
    if not client_email and getattr(reservation, 'client', None) is not None:
        client_email = reservation.client.email
    if not client_email:
        client_email = 'unknown'

    payload = (
        f"RESERVATION:{reservation.id}|TOKEN:{getattr(reservation, 'qr_token', '')}|"
        f"CLIENT:{client_email}|SLOT:{getattr(reservation, 'slot_id', '')}"
    )
    digest = hashlib.sha256(payload.encode('utf-8')).digest()
    modules = 29
    cell = size // modules
    margin = (size - modules * cell) // 2

    def bit_at(x, y):
        idx = (x * 31 + y * 17) % len(digest)
        return (digest[idx] >> ((x + y) % 8)) & 1

    def is_finder(x, y, ox, oy):
        return ox <= x < ox + 7 and oy <= y < oy + 7

    rects = []
    for y in range(modules):
        for x in range(modules):
            finder = (
                is_finder(x, y, 1, 1) or
                is_finder(x, y, modules - 8, 1) or
                is_finder(x, y, 1, modules - 8)
            )
            draw = False
            if finder:
                lx = min(x % (modules - 8), x - 1 if x < 8 else x - (modules - 8))
                ly = min(y % (modules - 8), y - 1 if y < 8 else y - (modules - 8))
                draw = lx in (0, 6) or ly in (0, 6) or (2 <= lx <= 4 and 2 <= ly <= 4)
            else:
                draw = bool(bit_at(x, y))
            if draw:
                rects.append(
                    f'<rect x="{margin + x * cell}" y="{margin + y * cell}" '
                    f'width="{cell}" height="{cell}" fill="#111111"/>'
                )

    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" '
        f'viewBox="0 0 {size} {size}" role="img" aria-label="QR réservation">'
        f'<rect width="100%" height="100%" fill="#ffffff"/>'
        f'{"".join(rects)}'
        f'<metadata>{escape(payload)}</metadata>'
        f'</svg>'
    )
