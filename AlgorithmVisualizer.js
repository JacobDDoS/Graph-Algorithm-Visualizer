import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom"
import ReactFlow, {addEdge, removeElements} from 'react-flow-renderer';
import { dijkstra } from "./Graph-Algorithms/dijkstra";
import {RangeStepInput} from 'react-range-step-input';

const PRIMARY = 'rgba(173, 216, 230, 0.90)'

const initialElements = [
    { id: '1', type: 'input',style: {width: "20px", overflowY:"hidden", borderRadius: "10px", backgroundColor:'none'}, data: { label: '0' }, position: { x: 250, y: 5 } },
    // you can also pass a React Node as a label
    { id: '2', type: 'output', data: { label: '1' }, style: {width: "20px", borderRadius: "10px", backgroundColor:`none`},position: { x: 100, y: 100 } },
    // { id: 'e1-2', source: '1', target: '2', animated: false },
  ];

const AlgorithmVisualizer = () => {
      const [elements, setElements] = useState(initialElements);
      const [ANIMATION_SPEED_MS, setANIMATION_SPEED_MS] = useState(10)
      const [nextId, setNextId] = useState(3)
      const [nextEdgeId, setNextEdgeId] = useState(10000)
      const [edgeWeightLimit, setEdgeWeightLimit] = useState(1000);
      const [time, setTime] = useState(10);
      const [coloredNodes, setColoredNodes] = useState([]);
      const [randomCompleted, setRandomCompleted] = useState(true)
      const [show, setShow] = useState(true)
      const [randomAndForever, setRandomAndForever] = useState(false);
      const [reload, setReload] = useState(false);
      const [isRunning, setIsRunning] = useState(false)
      const [numOfNodes, setNumOfNodes] = useState(2);
      const [wantedNodes, setWantedNodes] = useState(10);
      const [wantedEdges, setWantedEdges] = useState(wantedNodes-1)
      const [graph, setGraph] = useState([])
      const [distArray, setDistArray] = useState([]);
      const onElementsRemove = (elementsToRemove) =>
    setElements((els) => removeElements(elementsToRemove, els));
  const onConnect = (params) => setElements((els) => addEdge(params, els));

  const wantedNodeChange = (e) => {
    if (!isRunning) {
        setWantedNodes(e.target.value);
        if (e.target.value > wantedEdges+1 ) {
            setWantedEdges(e.target.value-1)
        } else if ((e.target.value-1)*(e.target.value-2) < wantedEdges) {
            setWantedEdges((e.target.value-1)*(e.target.value-2))
        }
      }
  }

  const wantedEdgeChange = (e) => {
      if (!isRunning) {
          setWantedEdges(e.target.value)
      }
  }
  const setDistArrayUp = (numberOfNodes) => {
    let newDistArray = [];
    for (let i=0;i<numberOfNodes;i++) {
        newDistArray.push('∞');
    }
    setDistArray(newDistArray);
  }
  const randomizeGraph = () => {
    for (let i=0;i<elements.length;i++) {
        if (elements[i].data) {
            elements[i].style.backgroundColor = "#ffffff";
          
        } else {
            elements[i].labelStyle = {fill: null}
        }
    }
      setTimeout(()=> {
        while (elements.length > 2) {
            elements.pop();
        }
        let temp = elements;
        let tempId = 3;
        for (let i=0;i<wantedNodes-2;i++) {
          let randoX = Math.round(Math.random()*1200+50)
          let randoY = Math.round(Math.random()*500+50)
          let newNode = { id: `${tempId}`, data: { label: `${tempId-1}` }, style: {width: "20px", overflowY:"hidden", borderRadius: "10px"},position: { x: randoX, y: randoY } }
          temp.push(newNode)
          tempId++;
        }
        while (coloredNodes.length) {
            coloredNodes.pop()
        }
        setColoredNodes([])
        let usedPairs = [];
        //Creates the necessary edges that will connect all edges
        for (let i=0;i<wantedNodes;i++) {
            if (i==1) continue;
            let randoTarget = i
            if (i===0) randoTarget = wantedNodes;
            let newEdge = { id: `${i+1}-${randoTarget}`, source: `${i+1}`, target: `${randoTarget}`, animated: false }
            usedPairs.push([(i+1), randoTarget])
            let rando = Math.round(Math.random()*edgeWeightLimit)
            while (rando === 0) {
                rando = Math.round(Math.random()*edgeWeightLimit)
            }
            newEdge.arrowHeadType = "arrowclosed";
            newEdge.label = rando;
            temp.push(newEdge);
        }
        let repeatIndexNumber = 1;

        //Creates the random edges
        for (let i=0;i<wantedEdges-(wantedNodes-1);i++) {
            let isFound = true;
            let randoTarget1 = Math.round(Math.random()*(wantedNodes-1)) + 1
            let randoTarget2 = Math.round(Math.random()*(wantedNodes-1)) + 1
            while (randoTarget1 === randoTarget2 || randoTarget1 === 2 || randoTarget2 === 1 || usedPairs.indexOf([randoTarget1, randoTarget2]) !== -1 || isFound) {
                isFound = false;
                randoTarget1 = Math.round(Math.random()*(wantedNodes-1)) + 1
                randoTarget2 = Math.round(Math.random()*(wantedNodes-1)) + 1
                for (let i=0;i<temp.length;i++) {
                    if (temp[i].target && temp[i].source == randoTarget1 && temp[i].target == randoTarget2) {
                        isFound=true;
                        break;
                    }
                }
            }
            //Checks for a loop
            if (usedPairs.indexOf([randoTarget2, randoTarget1]) !== -1) {
                let newEdge = { id: `${randoTarget1}-${randoTarget2}-${repeatIndexNumber}-cycle`, source: `${randoTarget1}`, target: `${randoTarget2}`, animated: false }
                repeatIndexNumber++;
                let rando = Math.round(Math.random()*edgeWeightLimit)
                while (rando === 0) {
                    rando = Math.round(Math.random()*edgeWeightLimit)
                }
                usedPairs.push([randoTarget1, randoTarget2])
                newEdge.arrowHeadType = "arrowclosed";
                newEdge.label = rando;
                temp.push(newEdge);
            } else {
            let newEdge = { id: `${randoTarget1}-${randoTarget2}-${repeatIndexNumber}`, source: `${randoTarget1}`, target: `${randoTarget2}`, animated: false }
            repeatIndexNumber++;
            usedPairs.push([randoTarget1, randoTarget2])
            newEdge.arrowHeadType = "arrowclosed";
            let rando = Math.round(Math.random()*edgeWeightLimit)
            while (rando === 0) {
                rando = Math.round(Math.random()*edgeWeightLimit)
            }
            newEdge.label = rando;
            temp.push(newEdge);
            }
        }
        let isEdgeColored = true;
        while (isEdgeColored) {
            isEdgeColored = false;
            for (let i=0;i<temp.length;i++) {
                if (temp[i].target && temp[i].labelStyle && temp[i].labelStyle.fill !== null) {
                    isEdgeColored = true;
                    temp[i].labelStyle = {fill: null}
                }
            }
        }
        setElements(temp)
        temp = null;
        usedPairs = null;
        let tempGraph = [];
    for (let i=0;i<wantedNodes;i++) {
        let smallArr = [];
        for (let j=0;j<wantedNodes;j++) {
            smallArr.push(0)
        }
        tempGraph.push(smallArr);
    }
    for (let i=0;i<elements.length;i++) {
        if (!elements[i].data) {
            tempGraph[elements[i].source-1][elements[i].target-1] = elements[i].label;
        }
    }
    setGraph(tempGraph)
    setDistArrayUp(wantedNodes);
    
        setTimeout(()=> {
            setNumOfNodes(wantedNodes) 
          setShow(false)
        setShow(true)
        for (let i=0;i<elements.length;i++) {
            if (elements[i].data) {
                elements[i].style.backgroundColor = "#ffffff";
            } else {
                elements[i].labelStyle = {fill: null}
            }
        }
        setIsRunning(false)
        }, 200)
      }, 200)
    //   console.log("nextID: " + nextId)
    //   console.log("Wanted Nodes: " + wantedNodes)
    //   console.log("What type: " + typeof wantedNodes)
    //   console.log("What it will become: " + (wantedNodes+1))
    if (typeof wantedNodes === Number) {
        setNextId((wantedNodes+1));
    } else {
        setNextId(parseInt(wantedNodes, 10) + 1);
    }
    }

  const checkIfNodeExists = (node) => {
    let ans = false;
    for (let i=0;i<elements.length;i++) {
        if (elements[i].data) {
            if (elements[i].id == node) {
                ans = true;
                break;
            }
        }
    }
    return ans;
  }

  const addRandomEdge = () => {
    let randoTarget1 = Math.round(Math.random()*(numOfNodes-1)) + 1
    let randoTarget2 = Math.round(Math.random()*(numOfNodes-1)) + 1
    while (randoTarget1 === randoTarget2 || randoTarget1 === 2 || randoTarget2 === 1 || !checkIfNodeExists(randoTarget1) || !checkIfNodeExists(randoTarget2)) {
        randoTarget1 = Math.round(Math.random()*(numOfNodes-1)) + 1
        randoTarget2 = Math.round(Math.random()*(numOfNodes-1)) + 1
    }
    let newEdge = { id: `${randoTarget1}-${randoTarget2}-${nextEdgeId}`, source: `${randoTarget1}`, target: `${randoTarget2}`, animated: false }
    setNextEdgeId(nextEdgeId+1)
            newEdge.arrowHeadType = "arrowclosed";
            let rando = Math.round(Math.random()*edgeWeightLimit)
            while (rando === 0) {
                rando = Math.round(Math.random()*edgeWeightLimit)
            }
            newEdge.label = rando;
    for (let i=0;i<elements.length;i++) {
        if (elements[i].target && elements[i].source == randoTarget1 && elements[i].target == randoTarget2) {
            elements.splice(i, 1);
        }
    }
    setElements([...elements, newEdge])

    // let tempGraph = [];
    // for (let i=0;i<numOfNodes;i++) {
    //     let smallArr = [];
    //     for (let j=0;j<numOfNodes;j++) {
    //         smallArr.push(0)
    //     }
    //     tempGraph.push(smallArr);
    // }

    // for (let i=0;i<elements.length;i++) {
    //     if (!elements[i].data) {
    //         tempGraph[elements[i].source-1][elements[i].target-1] = elements[i].label;
    //     }
    // }

    // setGraph(tempGraph)
  }


    useEffect(()=> {
        if (randomAndForever && !isRunning && randomCompleted) {
            setIsRunning(true);
            setRandomCompleted(false);
            let randNodes = Math.round(Math.random()*40) + 20;
            let randEdges = randNodes-1 + Math.round(Math.random()*10*randNodes);
            if (randEdges > ((wantedNodes-1)*(wantedNodes-2))) {
                randEdges = ((wantedNodes-1)*(wantedNodes-2));
            }
            setWantedNodes(randNodes)
            setWantedEdges(randEdges)
                
    setTimeout(()=> {
        for (let i=0;i<elements.length;i++) {
            if (elements[i].data) {
                elements[i].style = {...elements[i].style, backgroundColor: "#ffffff"}
                
            } else {
                elements[i].labelStyle = {fill: null}
            }
        }
        while (coloredNodes.length) {
            coloredNodes.pop()
            setColoredNodes(coloredNodes)
        }
                setShow(false)
                setShow(true)
          randomizeGraph()

          setTimeout (() => {
            let tempGraph = [];
            for (let i=0;i<wantedNodes;i++) {
                let smallArr = [];
                for (let j=0;j<wantedNodes;j++) {
                    smallArr.push(0)
                }
                tempGraph.push(smallArr);
            }
        
            for (let i=0;i<elements.length;i++) {
                if (!elements[i].data) {
                    tempGraph[elements[i].source-1][elements[i].target-1] = elements[i].label;
                }
            }
        
            setGraph(tempGraph)
        
                    setShow(false)
                    setShow(true)
                dijkstraVisualizer(tempGraph, 0)
          }, 1000)
          
          

        
}, 500)
        }
    }, [randomAndForever, randomCompleted])


    //Responsible for coloring nodes
    useEffect(()=>{
        if (show === true) {
            if (coloredNodes.length === 0) {
                setElements((els)=>
                els.map((el)=>{
                    el.style = {...el.style, backgroundColor: "#ffffff"}
                    return el;
                })
                )
            } else {
            setElements((els) =>
      els.map((el) => {
          el.style = {...el.style, backgroundColor: "none"}
          for (let i=0;i<coloredNodes.length;i++) {
        if (el.data && el.data.label == (coloredNodes[i])) {
                el.style = {...el.style, backgroundColor: `${PRIMARY}`}
          break
        } else {
            el.style = {...el.style, backgroundColor: `#ffffff`}
        }
    }
        return el;
      })
    );
    }
        }
    }, [show, coloredNodes])

    /*
     useEffect(() => {
    setElements((els) =>
      els.map((el) => {
        if (el.id === '1' || el.id === 'e1-2') {
          // when you update a simple type you can just update the value
          el.isHidden = nodeHidden;
        }

        return el;
      })
    );
  }, [nodeHidden, setElements]);
*/


    //Responsible for adding an edge weight to the edges.
    useEffect(()=> {
        setTimeout(() => {

        
        if (!isRunning) {
            let nodesCount = 0;
        if (!elements[elements.length-1].data && elements[elements.length-1].arrowHeadType !== 'arrowclosed') {
            let rando = Math.round(Math.random() * edgeWeightLimit)
            while (rando === 0) {
                rando = Math.round(Math.random()*edgeWeightLimit)
            }
            let copy = elements.pop()
            copy.arrowHeadType = "arrowclosed";
            copy.label = rando;
            setElements([...elements, copy])
        }else {
        
        for (let i=0;i<elements.length;i++) {
            if (elements[i].data) {
                nodesCount = elements[i].id
            }
        }
        if ((nodesCount > numOfNodes || nodesCount < numOfNodes) && !randomAndForever) {
        setDistArrayUp(nodesCount);
        }
        setNumOfNodes(nodesCount);
    }

    //Creates adjancency Matrix
    let tempGraph = [];
    for (let i=0;i<nodesCount;i++) {
        let smallArr = [];
        for (let j=0;j<nodesCount;j++) {
            smallArr.push(0)
        }
        tempGraph.push(smallArr);
    }


    //Adds values to matrix based on edges.
    for (let i=0;i<elements.length;i++) {
        if (!elements[i].data) {
            tempGraph[elements[i].source-1][elements[i].target-1] = elements[i].label;
        }
    }

    setGraph(tempGraph)
        }
    }, 100)
    }, [elements, reload])



    //Adds Node
    const addNode = () => {
        console.log("NextID" + nextId)
        let copy = [...elements];
        let randoX = Math.round(Math.random()*800+50)
        let randoY = Math.round(Math.random()*500+50)
        let newNode = { id: `${nextId}`, data: { label: `${nextId-1}` }, style: {width: "20px", overflowY:"hidden", borderRadius: "10px"},position: { x: randoX, y: randoY } }
        copy.push(newNode)
        setNextId((nextId+1));
        setElements(copy)
    }




    //Responsible for Dijkstra Visualization

  const dijkstraVisualizer = (graph, src) => {
    let animations = [];
    let newDistArray = [];
    for (let i=0;i<graph.length;i++) {
        newDistArray.push('∞');
    }
    setDistArray(newDistArray);
    let ans = dijkstra(graph, src, animations)
    setTimeout(()=>{


        //Responsible for showing the Answer if there is one
    if (ans.length != 0) {
        while (coloredNodes.length) {
            coloredNodes.pop()
        }
        setColoredNodes([])
        for (let i=0;i<elements.length;i++) {
            if (elements[i].data) {
                elements[i].style.backgroundColor = "#ffffff";
            } else {
                elements[i].labelStyle = {fill: null}
            }
        }
        setShow(false)
        setShow(true)
        setTimeout(() => {
            setIsRunning(false)
            setRandomCompleted(true);
        }, (ans.length*2-1)*ANIMATION_SPEED_MS + 1000)
        setTimeout(()=> {
            let copyTime = time;
        for (let i=0;i<ans.length;i++) {
            if (i !== 0) {
                for (let j=0;j<elements.length;j++) {
                    
                    if (!elements[j].data && elements[j].source-1 == ans[i-1] && elements[j].target-1 == ans[i]) {
                        setTimeout(()=>{
                            elements[j].labelStyle = {fill: `${PRIMARY}`}
                            
                            setShow(false)
                            setShow(true)
                        }, copyTime)
                        copyTime += parseInt(ANIMATION_SPEED_MS, 10);
                        
                        break;
                    }
                    
                }
            }

            for (let j=0;j<elements.length;j++) {
                if (elements[j].data && elements[j].data.label == ans[i]) {
                    setTimeout(()=>{
                        let coloredCopy = coloredNodes;
                        coloredCopy.push(elements[j].data.label)
                        setColoredNodes(coloredCopy)
                        setShow(false);
                        setShow(true);
                        
                    }, copyTime)
                    copyTime += parseInt(ANIMATION_SPEED_MS, 10);
                    break;
                }
            }
            setElements(elements)
            
        }
    }, 1000)
    } else {
        setIsRunning(false)
    }

    
      }, animations.length*ANIMATION_SPEED_MS)

      for (let i=0;i<animations.length;i++) {
          if (animations[i][0] === "Node") {
            for (let j=0;j<elements.length;j++) {
                if (elements[j].data && elements[j].data.label == animations[i][1]) {
                    setTimeout(()=>{
                        let coloredCopy = coloredNodes;
                        coloredCopy.push(elements[j].data.label)
                        setColoredNodes(coloredCopy)
                        setShow(false);
                        setShow(true);
                    }, ANIMATION_SPEED_MS*i)
                    break;
                }
            }
          } else if (animations[i][0] === "Edge") {
            for (let j=0;j<elements.length;j++) {
                if (!elements[j].data && elements[j].source-1 == animations[i][1] && elements[j].target-1 == animations[i][2]) {
                    setTimeout(()=>{
                        elements[j].labelStyle = {fill: `${PRIMARY}`}
                        setElements(elements)
                        setShow(false)
                        setShow(true)
                    }, ANIMATION_SPEED_MS*i)
                }
            }
          } else if (animations[i][0] === "dist") {
            for (let j=0;j<elements.length;j++) {
                if (elements[j].data && elements[j].data.label == animations[i][1]) {
                    setTimeout(()=>{
                        let distArrayCopy = newDistArray;
                        distArrayCopy[animations[i][1]] = animations[i][2];
                        setDistArray(distArrayCopy);
                    }, ANIMATION_SPEED_MS*i)
                    break;
                }
            }
          }
      }
      setElements(elements);
  }

  

//Cleanup
useEffect(()=> {
    setDistArrayUp(numOfNodes)
    return () => {
      var highestTimeoutId = setTimeout(";");
      for (var i = 0 ; i < highestTimeoutId ; i++) {
        clearTimeout(i); 
      }
    }
  }, [])


    return <> 
    <div style={{marginTop: "70px", padding: "5px", overflowY: "hidden", border: "2px solid black"}} className="array-container">
    <div style={{height: "2500px", width: "2500px"}}>
          
      <ReactFlow id="react-flow" elements={elements} onElementsRemove={onElementsRemove}
        onConnect={onConnect}/>
          
      </div>
      
    </div>
  
  <div className="sort-bottom-group">
      <div className="sort-bottom-item">
          <button onClick={()=>{
              if (!isRunning) {
                while (coloredNodes.length) {
                    coloredNodes.pop()
                    setColoredNodes(coloredNodes)
                }
                // console.log('ran1')
                // let totalNodes = 0;
                //   for (let i=0;i<elements.length;i++) {
                //       if (elements[i].data) {
                //           console.log('ran2')
                //           elements[i].style.backgroundColor = "#ffffff";
                //           totalNodes = elements[i].id;
                //       } else {
                //           console.log('ran3')
                //           elements[i].labelStyle = {fill: null}
                //       }
                //   }

            //       console.log('ran4')

            //       setElements([...elements])

            //       console.log('ran5')

            //       let tempGraph = [];

            //       console.log("totalNodes: " + totalNodes)
            // for (let i=0;i<totalNodes;i++) {
            //     let smallArr = [];
            //     for (let j=0;j<totalNodes;j++) {
            //         smallArr.push(0)
            //     }
            //     tempGraph.push(smallArr);
            // }

            // console.log(tempGraph[8] + " length of temp graph")

            // console.log('ran6')
        
            // for (let item = 0;item<elements.length;item++) {
            //     console.log(item+": " + elements[item])
            // }
            // for (let i=0;i<elements.length;i++) {
            //     if (!elements[i].data) {
            //         console.log("element: " + (elements[i].source-1))
            //         console.log("element going to: " +(elements[i].target-1))
            //         console.log("edge weight: " + (elements[i].label))
            //         tempGraph[elements[i].source-1][elements[i].target-1] = elements[i].label;
            //         console.log("EDGE ADDED")
            //     }
            // }

            // console.log('ran7')
        
            // setGraph(() => [...tempGraph])
                  
                //   setShow(false)
                //         setShow(true)
              setIsRunning(true)
              dijkstraVisualizer(graph, 0)
              }
            }
              } className="btn" style={{marginTop: "5px"}}>Dijkstra's Algorithm</button>
              {/* <button className="btn" style={{marginTop: "5px"}}>Quick Sort</button>
              <button className="btn" style={{marginTop: "5px"}}>Bubble Sort</button> */}
      </div>
      <div className="sort-bottom-item" style={{width: "400px"}}>
    <button onClick={addNode} style={{marginTop: "10px"}}className="btn">Add New Node</button>
  
  
    <button onClick={()=> {
        if (!isRunning) {
            addRandomEdge();
        }
    }}style={{marginTop: "5px"}}className="btn">Add Random Edge</button>
    <button onClick={() => {
          if (!isRunning) {
            setRandomAndForever(true);
          }
        }
          } style={{marginTop: "5px"}} className="btn">Random and Forever</button>
    </div>
    <div className="sort-bottom-item" style={{ width: "500px"}}>
      <div style={{margin: "0 auto", width: "480px"}}>
          <div style={{width: "160px", display: "inline-block", margin: "0px"}}>
        <p className="slider-input-text">Number of Nodes</p>
        <p className="slider-input-text" style={{marginBottom:"5px"}}>Current: {wantedNodes} Nodes</p>
            <RangeStepInput
                min={3} max={100}
                value={wantedNodes} step={1}
                onChange={wantedNodeChange}
            />
        <p className="slider-input-text">Number of Edges</p>
        <p className="slider-input-text" style={{marginBottom:"5px"}}>Current: {wantedEdges} Edges</p>
            <RangeStepInput
                min={wantedNodes-1} max={((wantedNodes-1)*(wantedNodes-2))}
                value={wantedEdges} step={1}
                onChange={wantedEdgeChange}
            />
            </div>
          <div style={{width: "160px", display: "inline-block"}}>
        <p className="slider-input-text">Max Edge Weight</p>
        <p className="slider-input-text" style={{marginBottom:"5px"}}>Current: {edgeWeightLimit}</p>
            <RangeStepInput
                min={5} max={1000}
                value={edgeWeightLimit} step={1}
                onChange={(e)=> {setEdgeWeightLimit(e.target.value)}}
            />
            <p className="slider-input-text">Animation Speed</p>
        <p className="slider-input-text" style={{marginBottom:"5px"}}>Current: {ANIMATION_SPEED_MS} ms</p>
            <RangeStepInput
                min={5} max={1000}
                value={ANIMATION_SPEED_MS} step={1}
                onChange={(e) => {setANIMATION_SPEED_MS(e.target.value)}}
            />
            </div>
            <div style={{width: "150px", height: "110px", float: "right", display: "inline-block"}}>
      <button onClick={() => {
          if (!isRunning) {
            while (coloredNodes.length) {
                coloredNodes.pop()
                setColoredNodes(coloredNodes)
            }
            setShow(false)
            setShow(true)
                for (let i=0;i<elements.length;i++) {
                    if (elements[i].data) {
                        elements[i].style = {...elements[i].style, backgroundColor: "#ffffff"}
                        
                    } else {
                        elements[i].labelStyle = {fill: null}
                    }
                }
                
                while (coloredNodes.length) {
                    coloredNodes.pop()
                    setColoredNodes(coloredNodes)
                }
                setShow(false)
                setShow(true)
              setIsRunning(true);
          randomizeGraph()
          }
        }
          } style={{marginTop: "40px", float:"center"}} className="btn">Randomize</button>
          </div>
        </div>
    </div>
    </div>
    <h2 style={{fontFamily: "Noto Sans SC, sans-serif"}}>Distance Array: </h2>
    <div>
    <p style={{fontSize: '1.2rem'}}>[</p>
    {
        distArray.map((item, index) => {
            if (index != distArray.length-1) {
                return <span key={index}> 
                <p style={{display: "inline-block"}}>{item},</p>
                 <p style={{visibility: "hidden", display:"inline-block"}}>_</p>
                </span>
            } else {
                return <p key={index} style={{display: "inline-block"}}>{item}</p>
            }
        })
    }
    <p style={{fontSize: '1.2rem'}}>]</p>
    </div>
    </>
};

export default AlgorithmVisualizer;
