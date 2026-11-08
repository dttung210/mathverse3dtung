def clipHalfScreen(poly, a, b, c):
    def inside(P):
        return a * P[0] + b * P[1] - c <= 1e-9
    out = []
    for i in range(len(poly)):
        P = poly[i]
        Q = poly[(i + 1) % len(poly)]
        u = a * P[0] + b * P[1] - c
        v = a * Q[0] + b * Q[1] - c
        I = inside(P)
        J = inside(Q)
        if I and J:
            out.append(Q)
        elif I and not J:
            h = u / (u - v)
            out.append([P[0] + h * (Q[0] - P[0]), P[1] + h * (Q[1] - P[1])])
        elif not I and J:
            h = u / (u - v)
            out.append([P[0] + h * (Q[0] - P[0]), P[1] + h * (Q[1] - P[1])])
            out.append(Q)
    return out

# Test with p.a = 1, p.b = 1, p.c = 2; p.d = -1, p.e = 1, p.f = 1
box = [[0, 0], [8.5, 0], [8.5, 5.5], [0, 5.5]]
p1 = clipHalfScreen(box, 1, 1, 2)
p2 = clipHalfScreen(p1, -1, 1, 1)

print('p2 vertices count:', len(p2))
for v in p2:
    print('Vertex:', [round(v[0], 2), round(v[1], 2)])

