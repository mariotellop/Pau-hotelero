<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pau Hotelero - Visualización 3D Interactiva</title>
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: #f0f0f0;
            font-family: Arial, sans-serif;
        }
        canvas {
            width: 100%;
            height: 100vh;
        }
        #info {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 5px 10px;
            border-radius: 5px;
        }
        #title {
            position: absolute;
            top: 10px;
            right: 10px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 5px 10px;
            border-radius: 5px;
        }
        #dayNight {
            position: absolute;
            top: 40px;
            right: 10px;
            color: white;
            background: rgba(0, 0, 0, 0.7);
            padding: 5px 10px;
            border-radius: 5px;
        }
        .controls {
            position: absolute;
            bottom: 10px;
            left: 10px;
        }
        button {
            padding: 10px;
            margin: 5px;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
        button:hover {
            background: rgba(50, 50, 50, 0.9);
        }
        #details {
            position: absolute;
            top: 50px;
            left: 10px;
            color: white;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 5px;
            display: none;
            max-width: 300px;
        }
    </style>
    <!-- Única importación de Three.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.134/examples/js/controls/OrbitControls.js"></script>
</head>
<body>
    <div id="info">Gira: clic izq | Zoom: rueda | Mueve: clic der | Clic para info | Doble clic en hotel para entrar</div>
    <div id="title">Pau Hotelero - Quintanar de la Orden</div>
    <div id="dayNight">Día</div>
    <div class="controls">
        <button id="toggleLight">Cambiar Día/Noche</button>
        <button id="toggleRain">Cambiar Verano/Invierno</button>
        <button id="resetRotation">Reiniciar Rotación</button>
        <button id="viewHotel">Vista Hotel</button>
        <button id="viewCourts">Vista Pistas</button>
        <button id="viewPool">Vista Piscina</button>
        <button id="colorChairsRed">Sillas Rojas</button>
        <button id="colorChairsBlue">Sillas Azules</button>
        <button id="colorBedsGreen">Camas Verdes</button>
        <button id="colorBedsPurple">Camas Moradas</button>
    </div>
    <div id="details"></div>
    <script src="script.js"></script>
</body>
</html>