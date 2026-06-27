from datetime import datetime


def _pdf_escape(value):
    return str(value).replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')


def build_simple_pdf(title, lines):
    """
    Génère un PDF texte minimal sans dépendance externe.
    """
    safe_lines = [_pdf_escape(title), '', *[_pdf_escape(line) for line in lines]]
    y = 780
    text_ops = ["BT", "/F1 18 Tf", f"72 {y} Td", f"({safe_lines[0]}) Tj"]
    text_ops.extend(["/F1 11 Tf"])
    for line in safe_lines[1:]:
        y_step = -18
        text_ops.append(f"0 {y_step} Td")
        text_ops.append(f"({line}) Tj")
    text_ops.append("ET")
    stream = "\n".join(text_ops).encode('latin-1', errors='replace')

    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length " + str(len(stream)).encode() + b" >>\nstream\n" + stream + b"\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for i, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{i} 0 obj\n".encode())
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_at = len(pdf)
    pdf.extend(f"xref\n0 {len(objects) + 1}\n".encode())
    pdf.extend(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        pdf.extend(f"{offset:010d} 00000 n \n".encode())
    pdf.extend(
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
        f"startxref\n{xref_at}\n%%EOF\n".encode()
    )
    return bytes(pdf)


def reservation_receipt_lines(reservation):
    slot = reservation.slot
    service = slot.service if slot else None
    return [
        f"Recu genere le: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        f"Reservation: #{reservation.id}",
        f"Client: {reservation.client.username} <{reservation.client.email}>",
        f"Service: {service.name if service else '-'}",
        f"Date: {slot.date.isoformat() if slot else '-'}",
        f"Horaire: {slot.start_time if slot else '-'} - {slot.end_time if slot else '-'}",
        f"Statut: {reservation.status}",
        f"Prix paye: {reservation.price:.2f}",
        f"Code QR: {reservation.qr_token or '-'}",
        f"Notes: {reservation.notes or '-'}",
    ]
