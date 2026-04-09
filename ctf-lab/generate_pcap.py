"""
Genera un PCAP de laboratorio con trafico HTTP/HTTPS simulado.
Uso educativo para ejercicios CTF.
"""

from scapy.all import IP, TCP, Raw, wrpcap


def build_http_get(src, dst, sport, dport, host, path):
    payload = (
        f"GET {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "User-Agent: CTF-Lab-Client/1.0\r\n"
        "Accept: */*\r\n"
        "\r\n"
    )
    return IP(src=src, dst=dst) / TCP(sport=sport, dport=dport, flags="PA") / Raw(load=payload)


def build_http_post(src, dst, sport, dport, host, path, body):
    payload = (
        f"POST {path} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "User-Agent: CTF-Lab-Client/1.0\r\n"
        "Content-Type: application/x-www-form-urlencoded\r\n"
        f"Content-Length: {len(body)}\r\n"
        "\r\n"
        f"{body}"
    )
    return IP(src=src, dst=dst) / TCP(sport=sport, dport=dport, flags="PA") / Raw(load=payload)


def build_https_like_packet(src, dst, sport, dport):
    # Simula bytes cifrados para comparacion frente al trafico HTTP en claro.
    fake_tls_bytes = b"\x16\x03\x01\x02\x00\x01\x00\x01\xfc\x03\x03" + b"\xaa" * 40
    return IP(src=src, dst=dst) / TCP(sport=sport, dport=dport, flags="PA") / Raw(load=fake_tls_bytes)


def main():
    packets = []

    client_ip = "192.168.56.10"
    web_ip = "192.168.56.20"
    ctf_ip = "192.168.56.30"
    secure_ip = "192.168.56.40"

    packets.append(build_http_get(client_ip, web_ip, 50100, 80, "intranet.local", "/news"))
    packets.append(build_http_get(client_ip, web_ip, 50101, 80, "shop.local", "/products?id=42"))
    packets.append(build_http_get(client_ip, ctf_ip, 50102, 80, "lab.ctf.local", "/status"))

    suspicious_body = (
        "username=admin&password=SuperSecret123&flag=CTF{w1r3sh4rk_http_pl41nt3xt}"
    )
    packets.append(
        build_http_post(
            client_ip,
            ctf_ip,
            50103,
            80,
            "lab.ctf.local",
            "/login",
            suspicious_body,
        )
    )

    packets.append(build_https_like_packet(client_ip, secure_ip, 50110, 443))
    packets.append(build_https_like_packet(secure_ip, client_ip, 443, 50110))

    wrpcap("captura_sospechosa.pcap", packets)
    print("Archivo generado: captura_sospechosa.pcap")


if __name__ == "__main__":
    main()
