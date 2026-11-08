import math

def fmt(x, d=2):
    try:
        val = float(x)
        s = f"{val:.{d}f}"
        if s.endswith('.00'):
            return s[:-3]
        if s.endswith('0') and '.' in s:
            return s[:-1]
        return s
    except:
        return '0'

print('fmt(2.0):', fmt(2.0))
print('fmt(2.5):', fmt(2.5))
print('fmt(0.123, 1):', fmt(0.123, 1))

