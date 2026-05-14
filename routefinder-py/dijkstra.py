import heapq

def run_dijkstra(grid, start, exit_node):
    rows = len(grid)
    cols = len(grid[0])
    
    # Priority queue: holds tuples of (distance, (row, col))
    pq = []
    heapq.heappush(pq, (0, start))
    
    distances = {}
    for r in range(rows):
        for c in range(cols):
            distances[(r, c)] = float('inf')
    distances[start] = 0
    
    previous_nodes = {}
    visited = set()
    visited_order = []
    
    while pq:
        current_distance, current_node = heapq.heappop(pq)
        
        # Jika node ini sudah pernah diproses (misalkan kita mau push path yang lebih baik sebelumnya)
        if current_node in visited:
            continue
            
        visited.add(current_node)
        
        # Kita tambahkan ke order agar UI bisa membuat animasi "scanning" 
        visited_order.append(current_node)
        
        # Jika sudah sampai tujuan (Exit), hentikan pencarian
        if current_node == exit_node:
            break
            
        r, c = current_node
        
        # Cek 4(Atas, Bawah, Kiri, Kanan)
        neighbors = [(r-1, c), (r+1, c), (r, c-1), (r, c+1)]
        
        for nr, nc in neighbors:
            # Cek apakah koordinat masih di dalam batas peta
            if 0 <= nr < rows and 0 <= nc < cols:
                # 1 artinya Tembok atau Api (Bahaya). Algoritma tidak boleh lewat sini!
                if grid[nr][nc] == 1:
                    continue
                
                # Bobot jarak antar tetangga adalah 1 langkah
                new_distance = current_distance + 1
                
                if new_distance < distances[(nr, nc)]:
                    distances[(nr, nc)] = new_distance
                    previous_nodes[(nr, nc)] = current_node
                    heapq.heappush(pq, (new_distance, (nr, nc)))
                    
    # Backtrack dari exit_node ke start_node untuk mendapatkan rute utuh
    path = []
    curr = exit_node
    while curr in previous_nodes:
        path.append(curr)
        curr = previous_nodes[curr]
        
    if path or start == exit_node:
        path.append(start)
        path.reverse()  # Balik array agar mulainya dari Start -> Exit
    else:
        path = []  # Jika array kosong, artinya tidak ada rute sama sekali (terjebak)
        
    return visited_order, path
