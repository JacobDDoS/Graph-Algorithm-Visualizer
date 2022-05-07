const { MinPriorityQueue, MaxPriorityQueue } = require('@datastructures-js/priority-queue');
 import {
    PriorityQueueOptions, // queue options interface
    PriorityQueueItem // queue item interface
  } from '@datastructures-js/priority-queue';
 export function dijkstra(graph, src, animations, ans) {
    let pq = new MinPriorityQueue({ priority: (edge) => edge.value });
     let V = graph.length;
     let dist = new Array(V);
     let visited = new Array(V);
    ans = [];
     for (let i = 0; i < V; i++) {
        dist[i] = Number.MAX_VALUE;
        visited[i] = false;
        ans.push([])
    }
    pq.enqueue({node: src, from: [], value: 0})


    while (!pq.isEmpty()) {
        const nextNode = pq.dequeue();

        if (!visited[nextNode.element.node] && !visited[1]) {
        animations.push(["Node", nextNode.element.node]);
        animations.push(["dist", nextNode.element.node, nextNode.element.value]);
        if (nextNode.element.node == 1) {
            for (let i=0;i<20;i++) {
                animations.push(["dist", nextNode.element.node, nextNode.element.value]);
            }
        }
        ans[nextNode.element.node] = [...nextNode.element.from, nextNode.element.node]
        visited[nextNode.element.node] = true;
        dist[nextNode.element.node] = nextNode.element.value;
        for(let v = 0; v < V; v++)
         {
             // Update dist[v] only if is not in
             // sptSet, there is an edge from u
             // to v, and total weight of path
             // from src to v through u is smaller
             // than current value of dist[v]
             if (   graph[nextNode.element.node][v] != 0 &&
                    dist[nextNode.element.node] + graph[nextNode.element.node][v] < dist[v])
             {
                 dist[v] = dist[nextNode.element.node] + graph[nextNode.element.node][v];
                 animations.push(["Edge", nextNode.element.node, v])
                 pq.enqueue({node: v, from: ans[nextNode.element.node], value: dist[v]})
             } else if (graph[nextNode.element.node][v] != 0) {
                 animations.push(["Edge", nextNode.element.node, v])
             }
         }
        }
    }
    dist = null;
    pq = null;
    visited = null;
    ans = ans[1];
    return ans;
 }