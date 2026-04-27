import qrcode
import sys

def generate_qr(url, filename):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(filename)
    print(f"QR Code for {url} saved to {filename}")

if __name__ == "__main__":
    url = "exp://192.168.0.107:8081"
    filename = "C:/Users/daniel/.gemini/antigravity/brain/e39de319-e59d-4560-934e-2b49b813cad3/expo_qr.png"
    generate_qr(url, filename)
