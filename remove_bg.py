from PIL import Image
import numpy as np
from collections import deque

input_path = "/Users/shkim/.gemini/antigravity/brain/5637d569-698e-443e-8515-57d3828c3d7a/toby_logo_transparent_1771982704277.png"
output_path = "/Users/shkim/Desktop/Project/Toby/teacher-random-tool/public/logo.png"

img = Image.open(input_path).convert("RGBA")
data = np.array(img, dtype=np.int32)
h, w = data.shape[:2]

# 코너 및 다양한 배경 위치 픽셀 확인
print("=== 코너 픽셀 분석 ===")
sample_coords = [
    (0,0),(0,50),(0,200),(0,400),(0,639),
    (50,0),(200,0),(400,0),(639,0),
    (639,639),(0,639),(639,0),
    (50,50),(100,100),(150,150),
    (320,10),(10,320)
]
for y,x in sample_coords:
    print(f"  [{y:3d},{x:3d}] = {tuple(data[y,x])}")

# 배경 색상 확인: 어두운 회색 ~86 and 밝은 회색 ~166
# 이 두 색이 교차하는 체커보드 패턴
# 두 가지 기준 색 설정
DARK_BG = 86   # 어두운 체커
LIGHT_BG = 166  # 밝은 체커

def is_background(r, g, b, a):
    """체커보드 배경 판별"""
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    chroma = max_c - min_c
    avg = (r + g + b) / 3.0
    
    # 채도가 거의 없고 (회색계열)
    if chroma > 25:
        return False
    
    # 어두운 배경 체커: 60~110
    if 55 <= avg <= 115:
        return True
    
    # 밝은 배경 체커: 140~190
    if 140 <= avg <= 200:
        return True
    
    return False

# 모든 엣지에서 BFS
visited = np.zeros((h, w), dtype=bool)
to_remove = np.zeros((h, w), dtype=bool)
queue = deque()

# 전체 엣지 스캔
for x in range(w):
    for y in [0, h-1]:
        r,g,b,a = data[y,x]
        if not visited[y,x] and is_background(int(r),int(g),int(b),int(a)):
            visited[y,x] = True
            to_remove[y,x] = True
            queue.append((y,x))

for y in range(h):
    for x in [0, w-1]:
        r,g,b,a = data[y,x]
        if not visited[y,x] and is_background(int(r),int(g),int(b),int(a)):
            visited[y,x] = True
            to_remove[y,x] = True
            queue.append((y,x))

print(f"\n초기 시드 픽셀: {to_remove.sum()}")

# 8방향 BFS
while queue:
    y, x = queue.popleft()
    for dy, dx in [(-1,0),(1,0),(0,-1),(0,1),(-1,-1),(-1,1),(1,-1),(1,1)]:
        ny, nx = y+dy, x+dx
        if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
            visited[ny, nx] = True
            r,g,b,a = data[ny,nx]
            if is_background(int(r),int(g),int(b),int(a)):
                to_remove[ny, nx] = True
                queue.append((ny, nx))

print(f"제거할 배경 픽셀: {to_remove.sum()}")

result_data = np.array(img, dtype=np.uint8)
result_data[to_remove, 3] = 0

result = Image.fromarray(result_data)
result.save(output_path, "PNG")
print(f"저장 완료: {output_path}")
