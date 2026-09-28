import string
import time
import os

# ============================================================
# CONFIGURATION
# ============================================================

DELAY = 0.8


# ============================================================
# TERMINAL HELPERS
# ============================================================

def clear():
    os.system("cls" if os.name == "nt" else "clear")


def pause(message="Press ENTER to continue..."):
    input(f"\n{message}")


def type_text(text, delay=0.015):
    for char in text:
        print(char, end="", flush=True)
        time.sleep(delay)
    print()


def banner(title):
    print("\n" + "=" * 65)
    print(f" {title}")
    print("=" * 65)


# ============================================================
# 1. XOR ENCRYPTION
# ============================================================

def xor_encrypt(text, key):
    data = text.encode("utf-8")
    return bytes(byte ^ key for byte in data)


def xor_decrypt(ciphertext, key):
    return bytes(byte ^ key for byte in ciphertext)


# ============================================================
# 2. ENGLISH LANGUAGE SCORING
# ============================================================

COMMON_WORDS = [
    "THE", "AND", "THIS", "IS", "A",
    "TO", "OF", "IN", "MESSAGE",
    "SECRET", "HELLO", "ATTACK",
    "KEY", "MEET"
]


def score_english(data):

    try:
        text = data.decode("ascii")
    except UnicodeDecodeError:
        return -100000

    score = 0

    # Printable characters
    for char in text:
        if char in string.printable:
            score += 1
        else:
            score -= 10

    # Spaces
    score += text.count(" ") * 3

    # Common English letters
    for char in text.upper():
        if char in "ETAOINSHRDLU":
            score += 1

    # Common words
    upper_text = text.upper()

    for word in COMMON_WORDS:
        if word in upper_text:
            score += 15

    return score


# ============================================================
# 3. STAGE 1 — INTERCEPT CIPHERTEXT
# ============================================================

def stage_intercept(ciphertext):

    clear()

    banner("STAGE 1 — INTERCEPT")

    type_text("[+] Communication intercepted.")
    type_text("[+] Ciphertext captured.")
    type_text("[!] Secret key is NOT available.")

    print("\nCiphertext:")
    print(" ".join(f"{byte:02X}" for byte in ciphertext))

    print("\nKey: ???")

    pause()


# ============================================================
# 4. STAGE 2 — IDENTIFY THE CIPHER
# ============================================================

def stage_identify():

    clear()

    banner("STAGE 2 — ANALYZE")

    type_text("[+] Analyzing the encryption pattern...")
    time.sleep(DELAY)

    print("\nObserved properties:")
    print("  • Single-byte transformation")
    print("  • Same operation applied to every byte")
    print("  • Small key space")
    print("  • XOR structure suspected")

    time.sleep(DELAY)

    print("\n[+] Cipher identified: SINGLE-BYTE XOR")

    print("\nKey space:")
    print("  0 → 255")
    print("  Total possibilities: 256")

    pause()


# ============================================================
# 5. STAGE 3 — BRUTE FORCE
# ============================================================

def stage_bruteforce(ciphertext):

    clear()

    banner("STAGE 3 — BRUTE FORCE")

    type_text("[+] Starting key-space search...")
    print()

    candidates = []

    for key in range(256):

        plaintext = xor_decrypt(ciphertext, key)
        score = score_english(plaintext)

        candidates.append(
            (score, key, plaintext)
        )

        # Display selected attempts
        if key in [0, 1, 2, 10, 20, 30, 40, 41, 42, 43, 50, 100, 150, 200, 255]:
            try:
                text = plaintext.decode("ascii")
            except UnicodeDecodeError:
                text = "non-printable"

            print(
                f"Testing key {key:3d}  →  {text[:35]}"
            )

            time.sleep(0.08)

    print("\n[+] 256 keys tested.")

    return candidates


# ============================================================
# 6. STAGE 4 — SCORE CANDIDATES
# ============================================================

def stage_scoring(candidates):

    clear()

    banner("STAGE 4 — SCORE CANDIDATES")

    type_text(
        "[+] Brute force produced 256 possible plaintexts."
    )

    type_text(
        "[+] Now we measure which candidate looks like English."
    )

    time.sleep(DELAY)

    candidates.sort(
        reverse=True,
        key=lambda x: x[0]
    )

    print("\nTOP CANDIDATES")
    print("-" * 65)

    print(
        f"{'KEY':<8}"
        f"{'SCORE':<10}"
        f"PLAINTEXT"
    )

    print("-" * 65)

    for score, key, plaintext in candidates[:5]:

        try:
            text = plaintext.decode("ascii")
        except UnicodeDecodeError:
            text = "non-printable"

        print(
            f"{key:<8}"
            f"{score:<10}"
            f"{text[:40]}"
        )

        time.sleep(0.4)

    pause()


# ============================================================
# 7. STAGE 5 — RECOVER KEY
# ============================================================

def stage_recover(candidates):

    clear()

    banner("STAGE 5 — KEY RECOVERY")

    best_score, best_key, best_plaintext = candidates[0]

    type_text("[+] Strongest candidate identified.")
    time.sleep(DELAY)

    print("\nAnalyzed:")
    print("  256 possible keys")

    print("\nMost likely key:")
    print(f"  >>> {best_key}")

    time.sleep(DELAY)

    print("\n[✓] SECRET KEY RECOVERED")

    pause()


# ============================================================
# 8. STAGE 6 — DECRYPT
# ============================================================

def stage_decrypt(candidates):

    clear()

    banner("STAGE 6 — DECRYPT")

    best_score, best_key, best_plaintext = candidates[0]

    try:
        plaintext = best_plaintext.decode("ascii")
    except UnicodeDecodeError:
        plaintext = repr(best_plaintext)

    type_text("[+] Applying recovered key...")
    time.sleep(DELAY)

    print("\n" + "-" * 65)

    print(f"KEY       : {best_key}")
    print(f"PLAINTEXT : {plaintext}")

    print("-" * 65)

    time.sleep(DELAY)

    print("\n" + "=" * 65)
    print("              CRYPTANALYSIS SUCCESS")
    print("=" * 65)

    print("\n✓ Cipher analyzed")
    print("✓ 256 keys tested")
    print("✓ Key recovered")
    print("✓ Plaintext recovered")

    print("\n")

    pause("Press ENTER to finish the demonstration...")


# ============================================================
# 9. MAIN PROGRAM
# ============================================================

def main():

    clear()

    banner("SYMMETRIC CIPHER — LIVE CRYPTANALYSIS")

    print("\nThis demonstration uses a weak single-byte XOR cipher.")
    print("The purpose is to demonstrate the cryptanalysis process.\n")

    plaintext = input("Enter plaintext: ")

    try:
        key = int(input("Enter secret key (0-255): "))
    except ValueError:
        print("Invalid key.")
        return

    if not 0 <= key <= 255:
        print("Key must be between 0 and 255.")
        return

    # --------------------------------------------------------
    # ENCRYPTION
    # --------------------------------------------------------

    clear()

    banner("ENCRYPTION")

    print(f"\nPlaintext : {plaintext}")
    print(f"Secret key: {key}")

    time.sleep(DELAY)

    ciphertext = xor_encrypt(plaintext, key)

    print("\n[+] Encryption complete.")

    print("\nCiphertext:")
    print(" ".join(f"{byte:02X}" for byte in ciphertext))

    print("\n🔒 KEY HIDDEN FROM ATTACKER")

    pause("Press ENTER to hand the ciphertext to the attacker...")

    # --------------------------------------------------------
    # ATTACK
    # --------------------------------------------------------

    stage_intercept(ciphertext)

    stage_identify()

    candidates = stage_bruteforce(ciphertext)

    stage_scoring(candidates)

    stage_recover(candidates)

    stage_decrypt(candidates)


if __name__ == "__main__":
    main()
