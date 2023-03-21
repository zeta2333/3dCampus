//导入three.js
import * as THREE from 'three';
//导入轨道控制器
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
//导入第一人称控制器
import { FirstPersonControls } from 'three/examples/jsm/controls/FirstPersonControls';
//导入FBX模型加载器
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
//导入tween动画库
import * as TWEEN from 'tween';
//导入gsap动画库
import gsap from 'gsap';

let scene, camera, renderer, controls; //四要素：场景、相机、渲染器、控制器
let controls1;//第一人称视角测试
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(); // 射线，鼠标
let intersects;
let modelObj;// 模型，简易用户界面
let time = 0, timeEnd = -1;// 当前时刻，结束时刻
let tween;
let moveCameraFlag = false, ctrlUpdFlag = true, fppFlag = false, speedFlag = 1, speedAdjustFlag = true; // 标志
//按钮定义
let resetBtn, measureBtn, firstPersonBtn, quickLocateSelector, playPauseBtn;
let fastSpeedBtn, normalSpeedBtn, lowSpeedBtn;
let wanderBtn, circleBtn; //按钮


// 漫游路线上点的坐标数据
let pointArr1 = [
    115, 0, 82,
    130, -15, -6,
    17, -15, -6,
    17, -15, 13,
    -66, -15, 12,
    -80, -15, -12,
    -45, -15, -90,
    122, -15, -87,
    122, -15, -6
];
let pointArr2 = [
    115, 0, 82,
    62.2, -15, 50,
    31.2, -15, 50,
    31.2, -15, 62,
    -51, -15, 62,
    -51, -15, 63.5,
    -38, -15, 63.5,
    -38, -15, 43,
    -45, -15, 43,
    -45, -15, 50,
    -108, -15, 50,
    -121, -15, 90,
    72, -15, 90
];
let pointArrB201 = [
    115, 0, 82,
    107, -16, 36,
    91, -15, 36,
    91, -10, 22,
    94, -10, 22,
    93, -7, 31,
    93, -6, 36,
    76, -5, 38,
    76, -5, 37.5,
    76, -5, 37,
];
let pointArrBuildingC = [
    115, 0, 82,
    133, -10, 60,
    133, -10, -50,
    130, -10, -50,
    127, -10, -50,
];
let pointArrBackDoor = [
    115, 0, 82,
    110, -15, 91,
    -81, -10, 93,
    -105, -10, 70,
    -103, -10, 70,
    -101, -10, 70
];
let pointArrTeacherHome = [
    115, 0, 82,
    51, -16, 49,
    32, -16, 49,
    32, -15, 36,
    -38, -16, 36,
    -38, -16, 50,
    -37, -16, 50,
    -36, -16, 50,
];
let pointArrA108 = [
    115, 0, 82,
    62.2, -15, 50,
    31.2, -15, 50,
    31.2, -15, 62,
    -50, -15, 62,
    -51, -15, 62,
    -52, -14.8, 63,
];
let curPointArr = [
    0, 0, 0,
    1, 1, 1
];
//当前漫游曲线
let curWanderCurve = ArrToCurve(curPointArr);

//时钟
const clock = new THREE.Clock();

//纹理加载器和纹理数组
const textureLoader = new THREE.TextureLoader();
const textureArray = new Array(19);

//材质纹理
{
    addTexture("./material/白瓷砖/Tiles040_2K_Color.png", textureLoader, textureArray, 0);
    addTexture("./material/白门/door.png", textureLoader, textureArray, 1);
    addTexture("./material/草地/草地.jpg", textureLoader, textureArray, 2);
    addTexture("./material/地砖/PavingStones002_2K_Color.jpg", textureLoader, textureArray, 3);
    addTexture("./material/红木/Wood009_2K_Color.jpg", textureLoader, textureArray, 4);
    addTexture("./material/灰砖地/Tiles050_1K_Color.jpg", textureLoader, textureArray, 5);
    addTexture("./material/马路/road.png", textureLoader, textureArray, 6);
    addTexture("./material/木地板/Wood085A_2K_Color.jpg", textureLoader, textureArray, 7);
    addTexture("./material/木墙/wood_07.jpg", textureLoader, textureArray, 8);
    addTexture("./material/墙体/Plaster001_2K_Color.jpg", textureLoader, textureArray, 9);
    addTexture("./material/石阶/Bricks066_2K_Color.jpg", textureLoader, textureArray, 10);
    addTexture("./material/石砖地面/red.jpg", textureLoader, textureArray, 11);
    addTexture("./material/石砖地面/yellow.jpg", textureLoader, textureArray, 12);
    addTexture("./material/苔藓石砖/PavingStones113_1K_Color.jpg", textureLoader, textureArray, 13);
    addTexture("./material/屋顶/roof.png", textureLoader, textureArray, 14);
    addTexture("./material/院徽/dianzi.png", textureLoader, textureArray, 15);
    addTexture("./material/石墙/stone wall.png", textureLoader, textureArray, 16);
    addTexture("./material/机器/machine.png", textureLoader, textureArray, 17);
    addTexture("./material/沙发/sofa.png", textureLoader, textureArray, 18);
}

//动画参数
const params = {
    wanderEvent: () => {  //漫游路线
        if (curPointArr.length / 3 > 2) {
            fppFlag = false;
            ctrlUpdFlag = false;
            speedAdjustFlag = false;
            time = 0;
            controls.autoRotate = false;
            moveCameraFlag = true;
            playPauseBtn.innerHTML = "暂停";
            ifDisablespeedBtns(true);
        }
    },
    playPauseEvent: () => { //播放/暂停
        //在漫游路线时才可以选择播放/暂停
        if (time != 0) {
            moveCameraFlag = !moveCameraFlag;
            playPauseBtn.innerHTML =
                moveCameraFlag ? "暂停" : "播放";
        }

    },
    measureEvent: () => { //测量开始/结束        
        isActive = !isActive;
        controls.enableRotate = isActive ? false : true;
        renderer.domElement.style.cursor =
            isActive ? "crosshair" : "unset";
        measureBtn.innerHTML =
            !isActive ? "开始测量" : "结束测量";
        !isActive ? clearLines() : null;

    },
    controlsEvent: () => { //环绕
        ctrlUpdFlag = true;
        controls.autoRotate = controls.autoRotate ? false : true;
    },
    cmrPosEvent: () => { //输出相机位置
        console.log(camera);
        console.log("相机位置：", camera.position);
    },
    fppEvent: () => { //视角转换
        fppFlag = !fppFlag;
        //切换视角时，重置相机位置
        camera.position.set(115, 0, 82);
    },
    resetEvent: () => { //相机重置

        //标签、变量重置
        controls.autoRotate = false;
        moveCameraFlag = false;
        speedAdjustFlag = true;
        fppFlag = false;
        ctrlUpdFlag = true;
        time = 0;
        curPointArr = [0, 0, 0, 1, 1, 1]
        //按钮重置
        playPauseBtn.innerHTML = "播放";
        quickLocateSelector.selectedIndex = 0;
        quickLocateSelector.disabled = false;
        ifDisablespeedBtns(false);
        //速度重置
        params.speedControlEvent.normalSpeed();
        //镜头位置重置
        const tarPos = { x: 115, y: 0, z: 82 };
        const lookPos = { x: 0, y: 0, z: 0 };
        //重置时约束镜头回正的速度
        tweenMove(camera, tarPos, lookPos, Math.max(distance(camera.position, tarPos) / 400, 1));
    },
    locateEvent: { //快速定位
        eastOverlook: () => {
            ctrlUpdFlag = false;
            const tarPos = { x: 207, y: 29, z: -3 };
            const lookPos = { x: 0, y: 0, z: 0 };
            tweenMove(camera, tarPos, lookPos, 1);
        },
        buildingC: () => {
            curPointArr = pointArrBuildingC;
            curWanderCurve = ArrToCurve(curPointArr);
            params.wanderEvent();
        },
        backDoor: () => {
            curPointArr = pointArrBackDoor;
            curWanderCurve = ArrToCurve(curPointArr);
            params.wanderEvent();
        },
        houseOfTeachers: () => {
            curPointArr = pointArrTeacherHome;
            curWanderCurve = ArrToCurve(curPointArr);
            params.wanderEvent();
        },
        A108: () => {
            curPointArr = pointArrA108;
            curWanderCurve = ArrToCurve(curPointArr);
            params.wanderEvent();
        },
        B201: () => {
            curPointArr = pointArrB201;
            curWanderCurve = ArrToCurve(curPointArr);
            params.wanderEvent();
        }
    },
    speedControlEvent: { //漫游速度和第一人称速度的控制
        fastSpeed: () => {
            if (speedAdjustFlag) {
                console.log("2倍速");
                speedFlag = 2;
                controls.autoRotateSpeed = 4;
                controls1.movementSpeed = 50;
                controls1.lookSpeed = 0.5;
                fastSpeedBtn.checked = true;
            } else {
                console.log("漫游过程中不允许调整速度！");
            }

        },
        normalSpeed: () => {
            if (speedAdjustFlag) {
                console.log("1倍速");
                speedFlag = 1;
                controls.autoRotateSpeed = 2;
                controls1.movementSpeed = 30;
                controls1.lookSpeed = 0.3;
                normalSpeedBtn.checked = true;
            } else {
                console.log("漫游过程中不允许调整速度！");
            }
        },
        lowSpeed: () => {
            if (speedAdjustFlag) {
                console.log("0.5倍速");
                speedFlag = 0.5;
                controls.autoRotateSpeed = 1;
                controls1.movementSpeed = 10;
                controls1.lookSpeed = 0.1;
                lowSpeedBtn.checked = true;
            } else {
                console.log("漫游过程中不允许调整速度！");
            }

        }
    }
};

//旋转物体常量名称、初始y轴赋值等操作

//物体数量
let objNum = 12;
//物体名称数组
let rotateObjNameArray = new Array(objNum);
{//填充数组
    for (let i = 0; i < rotateObjNameArray.length; i++) {
        rotateObjNameArray[i] = "glass_door" + (i + 1);
    }
    rotateObjNameArray[6] = "door1";
    rotateObjNameArray[7] = "door2";
    rotateObjNameArray[8] = "glass_door7";
    rotateObjNameArray[9] = "glass_door8";
    rotateObjNameArray[10] = "Rectangle3127";
    rotateObjNameArray[11] = "chiair1";
}

//初始物体数组
let rotateObjArray = new Array(objNum);
let glass_door1, glass_door2, glass_door3, glass_door4, glass_door5, glass_door6, door1, door2;//6扇玻璃门
let glass_door7, glass_door8, glass_door9;
let chairs;
{//物体填入数组
    rotateObjArray[0] = glass_door1;
    rotateObjArray[1] = glass_door2;
    rotateObjArray[2] = glass_door3;
    rotateObjArray[3] = glass_door4;
    rotateObjArray[4] = glass_door5;
    rotateObjArray[5] = glass_door6;
    rotateObjArray[6] = door1;
    rotateObjArray[7] = door2;
    rotateObjArray[8] = glass_door7;
    rotateObjArray[9] = glass_door8;
    rotateObjArray[10] = glass_door9;
    rotateObjArray[11] = chairs;
}


//初始y轴数组
let originYArray = new Array(objNum);
let gd1_oy, gd2_oy, gd3_oy, gd4_oy, gd5_oy, gd6_oy, d1_oy, d2_oy;
let gd7_oy, gd8_oy, gd9_oy;
let chairs_oy;
{//初始y轴填入数组
    originYArray[0] = gd1_oy;
    originYArray[1] = gd2_oy;
    originYArray[2] = gd3_oy;
    originYArray[3] = gd4_oy;
    originYArray[4] = gd5_oy;
    originYArray[5] = gd6_oy;
    originYArray[6] = d1_oy;
    originYArray[7] = d2_oy;
    originYArray[8] = gd7_oy;
    originYArray[9] = gd8_oy;
    originYArray[10] = gd9_oy;
    originYArray[11] = chairs_oy;
}

//fbx模型加载器和模型路径
const fbxLoader = new FBXLoader();
const path = require('../assets/model/building.FBX');

//页面初次加载时调用的函数
init();
animate();

//初始化函数
function init() {
    //各组件的初始化与函数的调用
    initScene();
    initCamera();
    initRenderer();
    addPlane();
    initControls();
    getBtn();
    eventListener();
    light();
    loadModel();

    //实现初次加载时相机转场动画效果
    params.resetEvent();
}

//场景
function initScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xB8D3FF) //0x87CEFA
}

//相机
function initCamera() {
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(400, 200, -300);//设置camera的位置
    scene.add(camera);//将camera添加到scene中    
    camera.lookAt(0, 0, 0);
}

//渲染器
function initRenderer() {
    //模型渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });//初始化，参数 antialias执行抗锯齿  { antialias: true }
    renderer.setSize(window.innerWidth, window.innerHeight);//设置渲染器的大小    
    document.body.appendChild(renderer.domElement);//将webgl渲染的canvas内容添加到body
}

//轨道控制器和第一人称控制器
function initControls() {

    //轨道控制器
    controls = new OrbitControls(camera, renderer.domElement); // TODO 判断用哪个控制器
    // controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false; //禁止平移，消除了右键的影响
    controls.maxPolarAngle = Math.PI / 2; //旋转角上限

    //第一人称视角控制器
    controls1 = new FirstPersonControls(camera, renderer.domElement);
    controls1.verticalMax = Math.PI / 8;
    controls1.movementSpeed = 30;
    controls1.lookSpeed = 0.3;
}

//获取屏幕上的按钮
function getBtn() {
    resetBtn = document.getElementById("r");
    measureBtn = document.getElementById("m");
    firstPersonBtn = document.getElementById("f");
    quickLocateSelector = document.getElementById("quickLocate");
    playPauseBtn = document.getElementById("space");
    fastSpeedBtn = document.getElementById("btnradio1");
    normalSpeedBtn = document.getElementById("btnradio2");
    lowSpeedBtn = document.getElementById("btnradio3");
    wanderBtn = document.getElementById("w");
    circleBtn = document.getElementById("3");
}

//速度按钮启用禁止
function ifDisablespeedBtns(flag) {
    fastSpeedBtn.disabled = flag;
    normalSpeedBtn.disabled = flag;
    lowSpeedBtn.disabled = flag;
}

//监听事件
function eventListener() {
    //监听事件：点击显示测距点
    window.addEventListener("click", onMouseClick, false);
    //监听事件：移动
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    //监听事件：若画面变化，则更新渲染界面
    window.addEventListener("resize", resize);
    //监听事件：各功能的快捷键，注意大小写
    window.addEventListener("keypress", (event) => {

        //输出key的值
        console.log(event.key);

        //r键(114)：重置相机
        if (event.key == "r") {
            console.log("相机重置");
            params.resetEvent();
        }
        //m键：测量距离
        if (event.key == "m") {
            console.log("距离测量");
            params.measureEvent();
        }
        //f键(102)：控制视角转换
        if (event.key == "f") {
            console.log("视角进行了转换");
            params.fppEvent();
        }
        //l键：开始漫游
        if(event.key == "l"){
            console.log("开始漫游");
            params.wanderEvent();
        }
        //u键(117)：2倍速
        if (event.key == "u") {
            params.speedControlEvent.fastSpeed();
        }
        //i键(105)：1倍速
        if (event.key == "i") {
            params.speedControlEvent.normalSpeed();
        }
        //o键(111)：0.5倍速
        if (event.key == "o") {
            params.speedControlEvent.lowSpeed();
        }
        //1键(49)：漫游路线1
        if (event.key == "1") {
            console.log("选择漫游路线1");
            curPointArr = pointArr1;
            curWanderCurve = ArrToCurve(curPointArr);
            quickLocateSelector.selectedIndex = 2;
        }
        //2键(50)：漫游路线2
        if (event.key == "2") {
            console.log("选择漫游路线2");
            curPointArr = pointArr2;
            curWanderCurve = ArrToCurve(curPointArr);
            quickLocateSelector.selectedIndex = 3;
        }
        //3键(51)：3D环绕预览
        if (event.key == "3") {
            console.log("开启3D环绕预览");
            params.controlsEvent();
        }
        //4键(52)：东侧概览
        if (event.key == "4") {
            console.log("东侧概览");
            params.locateEvent.eastOverlook();
            quickLocateSelector.selectedIndex = 5;
        }
        //5键(53)：C楼入口
        if (event.key == "5") {
            console.log("C楼入口");
            params.locateEvent.buildingC();
            quickLocateSelector.selectedIndex = 6;
        }
        //6键(54)：A108后门
        if (event.key == "6") {
            console.log("A楼后侧");
            params.locateEvent.backDoor();
            quickLocateSelector.selectedIndex = 7;
        }
        //7键(55)：教工之家
        if (event.key == "7") {
            console.log("教工之家");
            params.locateEvent.houseOfTeachers();
            quickLocateSelector.selectedIndex = 8;
        }
        //8键(56)：A108
        if (event.key == "8") {
            console.log("A108");
            params.locateEvent.A108();
            quickLocateSelector.selectedIndex = 9;
        }
        //9键(57)：B201
        if (event.key == "9") {
            console.log("B201");
            params.locateEvent.B201();
            quickLocateSelector.selectedIndex = 10;
        }
        //空格键(32)：则播放/暂停
        if (event.key == " ") {
            console.log("播放/暂停");
            params.playPauseEvent();
        }
        //c键(99)：显示相机位置
        if (event.key == "c") {
            console.log("显示相机位置");
            params.cmrPosEvent();
        }
    });

    //为按钮和下拉框添加响应事件
    //重置
    resetBtn.addEventListener('click', () => { params.resetEvent(); });

    //播放/暂停
    playPauseBtn.addEventListener('click', () => { params.playPauseEvent(); });

    //路线选择
    wanderBtn.addEventListener('click', () => { params.wanderEvent(); });

    //环绕
    circleBtn.addEventListener('click', () => { params.controlsEvent(); });

    //第一人称
    firstPersonBtn.addEventListener('click', () => { params.fppEvent(); });

    //漫游&快速定位
    quickLocateSelector.addEventListener('change', () => {
        let idx = quickLocateSelector.selectedIndex;
        let value = quickLocateSelector.options[idx].text;
        console.log(value);
        //根据选择的地点调用函数
        if (value == "漫游&快速定位") {
            curPointArr = [0, 0, 0, 1, 1, 1];
            curWanderCurve = ArrToCurve(curPointArr);
        }
        if (value == "漫游路线1") {
            curPointArr = pointArr1;
            curWanderCurve = ArrToCurve(curPointArr);
        }
        if (value == "漫游路线2") {
            curPointArr = pointArr2;
            curWanderCurve = ArrToCurve(curPointArr);
        }
        if (value == "东侧概览") params.locateEvent.eastOverlook();
        if (value == "C楼入口") params.locateEvent.buildingC();
        if (value == "A楼后侧") params.locateEvent.backDoor();
        if (value == "教工之家") params.locateEvent.houseOfTeachers();
        if (value == "A108") params.locateEvent.A108();
        if (value == "B201") params.locateEvent.B201();
    });

    //倍速控制
    fastSpeedBtn.addEventListener("click", () => { params.speedControlEvent.fastSpeed(); });
    normalSpeedBtn.addEventListener("click", () => { params.speedControlEvent.normalSpeed(); });
    lowSpeedBtn.addEventListener("click", () => { params.speedControlEvent.lowSpeed(); });

    //测量
    measureBtn.addEventListener("click", () => { params.measureEvent(); });
}

//载入模型
function loadModel() {
    fbxLoader.load(path, (object) => {
        modelObj = object;
        console.log("modelObj:", modelObj);
        modelObj.position.set(0, 0, 0);
        modelObj.scale.set(0.002, 0.002, 0.002);
        //modelObj为group类型的对象，需遍历子模型mesh类型的对象      
        modelObj.traverse(child => {
            if (child.isMesh) {
                //投影
                child.castShadow = true;
                child.receiveShadow = true;

                //找门
                for (let i = 0; i < rotateObjArray.length; i++) {
                    if (child.name == rotateObjNameArray[i] && rotateObjArray[i] == null) {
                        rotateObjArray[i] = child;
                        originYArray[i] = child.rotation.y;
                    }
                }
                //解决特定物体的材质覆盖问题
                if (child.name == "Line303") {
                    let material = child.material;
                    material[0] = material[1];
                }

                //贴材质：多材质物体
                if (!child.material.isMaterial) {
                    for (var i = 0; i < child.material.length; i++) {
                        var material = child.material[i];
                        if (material.name == "yellow ground") {
                            material.color = null;
                            material.map = textureArray[12];
                        }
                        if (material.name == "roof") {
                            material.color = null;
                            material.map = textureArray[14];
                        }
                        if (material.name == "yuanhui") {
                            material.color = null;
                            material.map = textureArray[15];
                        }
                        if (material.name == "machine") {
                            material.color = null;
                            material.map = textureArray[17];
                        }
                    }
                }

                //贴材质：单材质物体
                if (child.material.name == "yellow tiles") {
                    child.material.color = null;
                    child.material.map = textureArray[0];

                }
                if (child.material.name == "white door") {
                    child.material.color = null;
                    child.material.map = textureArray[1];

                }
                if (child.material.name == "grass") {
                    child.material.color = null;
                    child.material.map = textureArray[2];

                }
                if (child.material.name == "ground tiles") {
                    child.material.color = null;
                    child.material.map = textureArray[3];

                }
                if (child.material.name == "dark wood") {
                    child.material.color = null;
                    child.material.map = textureArray[4];

                }
                if (child.material.name == "grey brick ground") {
                    child.material.color = null;
                    child.material.map = textureArray[5];

                }
                if (child.material.name == "road") {
                    child.material.color = null;
                    child.material.map = textureArray[6];

                }
                if (child.material.name == "red wood") {
                    child.material.color = null;
                    child.material.map = textureArray[7];

                }
                if (child.material.name == "yellow wood") {
                    child.material.color = null;
                    child.material.map = textureArray[8];

                }
                if (child.material.name == "white wall") {
                    child.material.color = null;
                    child.material.map = textureArray[9];

                }
                if (child.material.name == "stone step") {
                    child.material.color = null;
                    child.material.map = textureArray[10];

                }
                if (child.material.name == "red ground") {
                    child.material.color = null;
                    child.material.map = textureArray[11];
                    child.material.roughness = 0;
                }
                if (child.material.name == "moss") {
                    child.material.color = null;
                    child.material.map = textureArray[13];
                }
                if (child.material.name == "Material #435") {
                    child.material.color = null;
                    child.material.map = textureArray[16];
                }
                if (child.material.name == "chair") {
                    child.material.color = null;
                    child.material.map = textureArray[18];
                }
            }
        });

        //将物体添加到场景中
        scene.add(modelObj);
    });
}

//帧刷新函数
function animate() {
    //请求下一动画帧刷新
    requestAnimationFrame(animate);

    //判断漫游时间
    timeEnd = Math.round(curWanderCurve.getLength()) * 18;
    //判断漫游速度
    if (speedFlag == 2) {
        timeEnd *= 0.5;
    }
    if (speedFlag == 0.5) {
        timeEnd *= 2;
    }

    //判断是否漫游，以及漫游路线
    if (moveCameraFlag && time != timeEnd) {
        //执行漫游
        moveCamera(curWanderCurve, timeEnd);

        //门的开关
        if (curPointArr == pointArr2) {
            //A楼入口的玻璃门
            if (time == 300 * 3 || time == 400 * 3) {
                for (let i = 0; i < 6; i++) {
                    rotate(rotateObjArray[i], originYArray[i], i % 2 ? 1 : -1, Math.PI / 2);
                }
            }
            //A108的大门
            if (time == 950 * 3 || time == 1450 * 3) {
                for (let i = 0; i < 2; i++) {
                    rotate(rotateObjArray[i + 6], originYArray[i + 6], i % 2 ? 1 : -1, Math.PI / 2);
                }
            }

            //A108内部的椅子
            if (time == 1050 * 3 || time == 1100 * 3) {
                rotate(rotateObjArray[11], originYArray[11], 1, Math.PI / 180 * 80);
            }

            //进入教工之家走廊的玻璃门
            if (time == 1600 * 3 || time == 1800 * 3) {
                for (let i = 0; i < 2; i++) {
                    rotate(rotateObjArray[i + 8], originYArray[i + 8], -1, Math.PI / 2);
                }
            }
            //出教工之家走廊的玻璃门
            if (time == 1900 * 3 || time == 2100 * 3) {
                rotate(rotateObjArray[10], originYArray[10], -1, Math.PI / 2);
            }
        }

        //二号路线的门自动开关
        // if (whichCurve == 2) {
        //     //A楼入口的玻璃门
        //     if (time == 300 * 3 || time == 400 * 3) {
        //         for (let i = 0; i < 6; i++) {
        //             rotate(rotateObjArray[i], originYArray[i], i % 2 ? 1 : -1, Math.PI / 2);
        //         }
        //     }
        //     //A108的大门
        //     if (time == 950 * 3 || time == 1450 * 3) {
        //         for (let i = 0; i < 2; i++) {
        //             rotate(rotateObjArray[i + 6], originYArray[i + 6], i % 2 ? 1 : -1, Math.PI / 2);
        //         }
        //     }
        //     //进入教工之家走廊的玻璃门
        //     if (time == 1600 * 3 || time == 1800 * 3) {
        //         for (let i = 0; i < 2; i++) {
        //             rotate(rotateObjArray[i + 8], originYArray[i + 8], -1, Math.PI / 2);
        //         }
        //     }
        //     //出叫教工之家走廊的玻璃门
        //     if (time == 1900 * 3 || time == 2100 * 3) {
        //         rotate(rotateObjArray[10], originYArray[10], -1, Math.PI / 2);
        //     }
        // }
    }
    else {
        //如果由于已经到达终点而停止漫游，则重置参数
        if (time == timeEnd) {
            time = 0;
            timeEnd = -1;
            moveCameraFlag = false;
            ctrlUpdFlag = true;
            speedAdjustFlag = true;
            playPauseBtn.innerHTML = "播放";
            ifDisablespeedBtns(false);
        }
    }

    //判断以哪种视角观察
    if (fppFlag) controls1.update(clock.getDelta());//第一人称控制器
    else ctrlUpdFlag ? controls.update() : null; //轨道控制器

    renderer.render(scene, camera); //渲染
    TWEEN.update();//tween动画实时刷新
}

//重置大小
function resize() {
    //更新摄像头
    camera.aspect = window.innerWidth / window.innerHeight;
    //更新摄像头的投影矩阵
    camera.updateProjectionMatrix();
    //更新渲染器
    renderer.setSize(window.innerWidth, window.innerHeight);
    //设置渲染器的像素比
    renderer.setPixelRatio(window.devicePixelRatio);
    //controls1处理大小功能
    controls1.handleResize();
}

//灯光
function light() {
    //环境光（整体的亮度）
    const ambientLight = new THREE.AmbientLight(0xf0f0f0, 0.8);
    scene.add(ambientLight);
    //头顶的太阳光
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.01);
    scene.add(sunLight);
    sunLight.position.set(263, 101, -5);
    sunLight.lookAt(0, 0, 0);
    //正面的暖色光
    const directionalLight = new THREE.DirectionalLight(0xfafad2, 0.5);
    scene.add(directionalLight);
    directionalLight.position.set(115, 0, 82);
    //背面的冷色光
    const directionalLight2 = new THREE.DirectionalLight(0xe6e6fa, 0.5);
    scene.add(directionalLight2);
    directionalLight2.position.set(-115, 0, -82);
}

//旋转开闭
function rotate(obj, originAxis, direction, range) {
    //若关，则开
    if (Math.round(obj.rotation.y * 100) / 100 == Math.round(originAxis * 100) / 100) {
        gsap.to(obj.rotation, { y: originAxis + direction * range, duration: 1 });
    }
    //若开，则关
    if (Math.round(obj.rotation.y * 100) / 100 == Math.round((originAxis + direction * range) * 100) / 100) {
        gsap.to(obj.rotation, { y: originAxis, duration: 1 });
    }
}

//添加材质
function addTexture(texturePath, textureLoader, textureArray, idx) {
    const curTexture = textureLoader.load(texturePath);
    curTexture.wrapS = THREE.RepeatWrapping;
    curTexture.wrapT = THREE.RepeatWrapping;
    textureArray[idx] = curTexture;
}

//移动相机
function moveCamera(curve, timeEnd) {
    // 把曲线分割成n段， 可以得到n+1个点
    let points = curve.getPoints(timeEnd);
    // 更新取点索引
    time += 3;
    // 相机所在点索引
    const index1 = time % timeEnd;
    // 前方视野所在位置点的索引
    const index2 = (time + 50) % timeEnd;
    // 根据索引取点
    let point = points[index1];
    let point1 = points[index2];
    // 修改相机和模型位置
    if (point && point.x) {
        camera.position.set(point.x, point.y, point.z);
        camera.lookAt(point1.x, point1.y, point1.z);
    }
}

//数组转换为曲线
function ArrToCurve(pointArr) {
    // 根据坐标数组转为点数组
    let points = [];
    for (let i = 0; i < pointArr.length; i += 3) {
        points.push(new THREE.Vector3(
            pointArr[i],
            pointArr[i + 1],
            pointArr[i + 2]
        ));
    }
    // 返回曲线
    return new THREE.CatmullRomCurve3(
        points,
        false/*是否闭合*/,
        'catmullrom',//"centripetal"
        0.1
    );
}

//tween物体位移
function tweenMove(obj, tarPos, lookPos, speed) {
    let srcPos = obj.position;
    tween = new TWEEN.Tween(srcPos);
    //位移花费的时间与位移量成正比，即速度保恒定
    tween.to(tarPos, 1000 * distance(srcPos, tarPos) / 50 / speed)
        .easing(TWEEN.Easing.Linear.None) // 时间-距离曲线样式（本质上为速度的变化规律）
        .onUpdate((prog) => {//响应animate()中的update方法
            //每一帧刷新时改变相机的当前位置
            let curPos = {
                x: srcPos.x + prog * (tarPos.x - srcPos.x),
                y: srcPos.y + prog * (tarPos.y - srcPos.y),
                z: srcPos.z + prog * (tarPos.z - srcPos.z)
            };
            obj.position.set(curPos.x, curPos.y, curPos.z);//设置相机当前位置
            obj.lookAt(lookPos.x, lookPos.y, lookPos.z);//设置相机朝向
        })
        .start();//不要忘记了启动
}

//空间两点间的距离
function distance(pA, pB) {
    return Math.sqrt(
        Math.pow(pA.x - pB.x, 2) +
        Math.pow(pA.y - pB.y, 2) +
        Math.pow(pA.z - pB.z, 2)
    );
}

//场景中添加地面
function addPlane() {
    const size = 10000;
    const floorGeometry = new THREE.PlaneGeometry(size, size, 1, 1);
    const floorMaterial = new THREE.MeshStandardMaterial({
        color: null,
        map: textureArray[2] //给地面添加草地材质
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI;
    // 地板接受阴影开启
    floor.receiveShadow = true;
    floor.position.y = -20;
    scene.add(floor);
}

//----------------测量距离--------------------

//测量的基本变量
let lineId = 0
let isActive = false //判断测量功能是否激活
let drawingLine = false //线段能否拖动
let markers = [] // {1:[],2:[]} 线的两个端点小球和线本身
let textDoms = []
let pointsDom = []

//世界坐标转为屏幕位置
function WorldtoScreenPosition(pos) {
    const worldVector = new THREE.Vector3(pos.x, pos.y, pos.z)
    const standardVector = worldVector.project(camera)
    const widthHalf = window.innerWidth / 2;
    const heightHalf = window.innerHeight / 2;
    return {
        x: Math.round(standardVector.x * widthHalf + widthHalf),
        y: Math.round(-standardVector.y * heightHalf + heightHalf),
        z: 1
    }
}

//点击事件
function onMouseClick(event) {
    if (isActive && event.button === 0) {
        //取鼠标与视线的交点
        raycaster.setFromCamera(mouse, camera)
        intersects = raycaster.intersectObjects(scene.children)
        if (intersects.length === 0) return

        //初次点击，会在点旁边添加距离文字
        if (!drawingLine) {
            //加入距离文字
            let text1 = document.createElement('span')
            text1.style.position = 'absolute'
            text1.style.top = '0'
            text1.style.color = 'red'
            text1.style.pointerEvents = 'none'
            let text2 = text1.cloneNode()
            document.body.appendChild(text1)
            document.body.appendChild(text2)
            textDoms[lineId] = [text1, text2]

            //加入2d的点：橙色的小点
            let point2d1 = document.createElement('div')
            point2d1.style.position = 'absolute'
            point2d1.style.width = '10px'
            point2d1.style.height = '10px'
            point2d1.style.borderRadius = '50%'
            point2d1.style.pointerEvents = 'none'
            point2d1.style.cursor = 'pointer'
            point2d1.style.transform = 'translate(-50%,-50%)'
            point2d1.style.top = '0'
            point2d1.style.background = 'orange'
            let point2d2 = point2d1.cloneNode()
            document.body.appendChild(point2d1)
            document.body.appendChild(point2d2)
            pointsDom[lineId] = [point2d1, point2d2]

            //场景加入3d中的两圆球
            let marker1 = new THREE.Mesh(
                new THREE.SphereGeometry(0.1, 10, 20),
                new THREE.MeshBasicMaterial({
                    color: 0xff5555,
                })
            );
            let marker2 = marker1.clone()
            markers[lineId] = [marker1, marker2]
            scene.add(marker1, marker2)


            //构建虚线
            const geometry = new THREE.BufferGeometry().setFromPoints(
                [intersects[0].point, intersects[0].point.clone()]
            )
            let line = new THREE.LineSegments(
                geometry,
                new THREE.LineDashedMaterial({
                    color: 0xff5555,
                    transparent: true,
                    depthTest: false,
                    dashSize: 0.1,//短划线的大小
                    gapSize: 0.1//短划线之间的距离
                })
            )
            //这行代码很关键,让屏幕外区域的点,正确显示
            line.frustumCulled = false
            markers[lineId].push(line)
            scene.add(line)

            marker1.lineId = marker2.lineId = line.lineId = lineId
            drawingLine = true


            let cacheId = lineId
            line.onBeforeRender = () => {
                //实时渲染text和2d的点
                const positions = line.geometry.attributes.position.array
                const v0 = new THREE.Vector3(
                    positions[0],
                    positions[1],
                    positions[2]
                )
                const v1 = new THREE.Vector3(
                    positions[3],
                    positions[4],
                    positions[5]
                )
                const distance = v0.distanceTo(v1)
                let [text1, text2] = textDoms[cacheId]
                text1.innerHTML = distance.toFixed(2) / 2 * 0.9 + 'm'
                text2.innerHTML = distance.toFixed(2) / 2 * 0.9 + 'm'

                let point1 = new THREE.Vector3().lerpVectors(v0, v1, 0)
                let point2 = new THREE.Vector3().lerpVectors(v0, v1, 1)
                point1 = WorldtoScreenPosition(point1)
                point2 = WorldtoScreenPosition(point2)
                text1.style.left = point1.x + "px"
                text1.style.top = point1.y + 5 + "px"
                text2.style.left = point2.x + "px"
                text2.style.top = point2.y + 5 + "px"

                let [point2d1, point2d2] = pointsDom[cacheId]
                point1 = WorldtoScreenPosition(v0)
                point2 = WorldtoScreenPosition(v1)
                point2d1.style.left = point1.x + "px"
                point2d1.style.top = point1.y + "px"
                point2d2.style.left = point2.x + "px"
                point2d2.style.top = point2.y + "px"


                //实时渲染3d的两球
                let [marker1, marker2] = markers[cacheId]
                marker1.position.set(v0)
                marker2.position.set(v1)
            }
        }
        else {//在第一个点存在的情况下再次点击，则会固定此线段
            let line = markers[lineId][2]
            //保存旧的material
            line.oldMaterial = line.material
            //虚线变实线
            line.material = new THREE.LineBasicMaterial({
                color: 0xff5555,
                transparent: true,
                depthTest: false
            })
            //更新点
            updateLinePoint(line, intersects[0].point, 3)

            //让2d中的两点可拖动
            let [point2d1, point2d2] = pointsDom[lineId]
            point2d1.style.pointerEvents = 'unset'
            point2d2.style.pointerEvents = 'unset'
            //监听两点的拖拽
            draggablePoint(point2d1, lineId)
            draggablePoint(point2d2, lineId)


            lineId++
            drawingLine = false
        }

    }
}

//移动事件
function onDocumentMouseMove(event) {
    event.preventDefault()
    mouse.x = (event.clientX / renderer.domElement.offsetWidth) * 2 - 1
    mouse.y = -(event.clientY / renderer.domElement.offsetHeight) * 2 + 1
    if (drawingLine) {
        raycaster.setFromCamera(mouse, camera)
        intersects = raycaster.intersectObjects(scene.children)
        if (intersects.length === 0) return
        let line = markers[lineId][2]
        line.computeLineDistances()
        updateLinePoint(line, intersects[0].point, 3)

    }
}

//拖点微调
function draggablePoint(el, id) {//el：元素，id：线段id
    let timeId = null
    let index = pointsDom[id].findIndex(item => item === el)
    let line = markers[id][2]
    el.addEventListener('mousedown', (e) => {
        timeId = setTimeout(() => { //0.1秒后显示长按
            console.log('长按')
            changeMaterial(line)
            //变虚线
            timeId = null
            //长按监听移动
            document.addEventListener('mousemove', handlePointMove)
        }, 100);
        document.addEventListener('mouseup', handlePointUp)
    })
    function handlePointMove() {
        //打出射线
        raycaster.setFromCamera(mouse, camera)
        intersects = raycaster.intersectObjects(scene.children)
        //排除含有lineId的物体
        intersects = intersects.filter(item => !('lineId' in item.object))
        if (intersects.length === 0) return
        //变更线段两端点的位置
        let arrayStart = index && 3
        updateLinePoint(line, intersects[0].point, arrayStart)
    }


    function handlePointUp() {
        if (timeId) {
            console.log('点击')
            clearTimeout(timeId)
            timeId = null
        } else {
            changeMaterial(line)
        }
        document.removeEventListener('mouseup', handlePointUp)
        document.removeEventListener('mousemove', handlePointMove)
    }

}

//实线与虚线的交换
function changeMaterial(object3d) {
    let temp = object3d.oldMaterial
    object3d.oldMaterial = object3d.material
    object3d.material = temp
}

//拖动结束后更新线的端点
function updateLinePoint(line, point, arrayIndex) {
    const positions = line.geometry.attributes.position.array
    positions[arrayIndex] = point.x
    positions[arrayIndex + 1] = point.y
    positions[arrayIndex + 2] = point.z
    line.geometry.attributes.position.needsUpdate = true
}

//esc删除绘制
window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        //清除没画完的线
        if (drawingLine) {
            [...textDoms[lineId], ...pointsDom[lineId]].forEach(item => item.remove())
            markers[lineId].forEach(item => scene.remove(item))
            markers[lineId] = null
            textDoms[lineId] = null
            pointsDom[lineId] = null
            drawingLine = false
        }
    }
})

//清空线段
function clearLines() {
    for (var i = 0; i < markers.length; i++) {
        if (markers[i] == null) continue;
        scene.remove(markers[i][0], markers[i][1]);
        scene.remove(markers[i][2]);
        document.body.removeChild(pointsDom[i][0]);
        document.body.removeChild(pointsDom[i][1]);
        document.body.removeChild(textDoms[i][0]);
        document.body.removeChild(textDoms[i][1]);
    }
    markers = [];
    pointsDom = [];
    textDoms = [];
    lineId = 0;
}


//鼠标点击事件
function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
        //找到相交的物体
        let itsobj = intersects[0].object;
        //找到鼠标点击的位置的坐标
        let itspoint = intersects[0].point;
        //输出物体的名称和材质名
        console.log(
            "点坐标:", itspoint,
            "\n物体:", itsobj,
            "\n物体名:", itsobj.name,
            "\n材质名:", (itsobj.isMesh && itsobj.material.name != null) ? itsobj.material.name : "无材质名"
        );
    }
}