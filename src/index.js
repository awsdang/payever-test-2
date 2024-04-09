import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


  const countryInfos = [
    {
      index: 0,
      name: 'netherlands',
      latlng: [52.132633, 5.291266],
    },
    {
      index: 1,
      name: 'belgium',
      latlng: [50.503887, 4.469936],
    },
    {
      index: 2,
      name: 'germany',
      latlng: [51.165691, 10.451526],
    },
    {
      index: 3,
      name: 'austria',
      latlng: [47.516231, 14.550072],
    },
    {
      index: 4,
      name: 'sweden',
      latlng: [60.128161, 18.643501],
    },
    {
      index: 5,
      name: 'finland',
      latlng: [61.92411, 25.748151],
    },
    {
      index: 6,
      name: 'norway',
      latlng: [60.472024, 8.468946],
    },
    {
      index: 7,
      name: 'denmark',
      latlng: [56.26392, 9.501785],
    },
    {
      index: 8,
      name: 'uk',
      latlng: [55.378051, -3.435973],
    },

  ]


class Stars extends THREE.Group {
  constructor() {
    super()
    this.createStars()
  }



  update = () => {
    this.rotation.y += 0.006
  }

  createStars = () => {
    const geometry = new THREE.BufferGeometry()
    const size = 3000
    const numOfStars = 800
    let points = []

    for (let i = 0; i < numOfStars; i += 3) {
      points.push(
        new THREE.Vector3(
          size * (Math.random() - 0.5),
          size * (Math.random() - 0.5),
          size * (Math.random() - 0.5),
        ),
      )
    }
    geometry.setFromPoints(points)
    geometry.computeVertexNormals()

    const material = new THREE.PointsMaterial({
      size: 2,
      color: 0xffffff,
    })
    this.add(new THREE.Points(geometry, material))
  }
}

class Earth extends THREE.Group {
  world
  countryPoints = []

  constructor() {
    super()
    const loader = new THREE.TextureLoader()

    const seaGeo = new THREE.SphereGeometry(99, 60, 60)

    const geometry = new THREE.SphereGeometry(100, 60, 60)
    const material = new THREE.MeshPhongMaterial({
      map: loader.load(`./assets/world-map-dot-white.png`),
      bumpScale: 1.0,
      transparent: true,
     
      side: THREE.DoubleSide, 
    })
    

    const seaMat = new THREE.MeshStandardMaterial({
      color: "white",
      transparent: true,
      opacity: 0.1
    })
    const earthSea = new THREE.Mesh(seaGeo, seaMat)
    const earth = new THREE.Mesh(geometry, material)
    
    this.world = new THREE.Group()

    this.world.add(earth)
    this.world.add(earthSea)
    this.world.rotation.y = -Math.PI/2 - 1
    this.world.receiveShadow = true
    this.createCountryPoints()
  }

  update = () => {
    this.world.rotation.y += 0.002
  }

  createCountryPoints() {
    countryInfos.forEach((country) => {
      const latitude = country.latlng[0]
      const longitude = country.latlng[1]
      const point = new THREE.Group()
      point.name = country.name

      this.createFlagOnGround(point)
      this.setPointPos(point, latitude, longitude)

      this.countryPoints.push(point) 
      this.world.add(point)
    })

    this.add(this.world)
  }

  createFlagOnGround(point) {
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(1, 32),
      new THREE.MeshBasicMaterial({
        color:'white',
        side: THREE.DoubleSide,
        name: 'point-ground',
        transparent: true,
        opacity: 0.8,
      }),
    )

    point.add(ground)
    ground.rotateX(Math.PI / 2)
  }

  setPointPos(
    point,
    latitude,
    longitude,
  ) {
    point.position.copy(this.translateGeoCoords(latitude, longitude, 98))
    point.lookAt(new THREE.Vector3(0, 0, 0))
    point.rotateX(80)
    point.translateY(2.5)
  }


  translateGeoCoords(
    latitude,
    longitude,
    radius,
  ) {

    const phi = (latitude * Math.PI) / 180

    const theta = ((longitude - 180) * Math.PI) / 180

    const x = -radius * Math.cos(phi) * Math.cos(theta)
    const y = radius * Math.sin(phi)
    const z = radius * Math.cos(phi) * Math.sin(theta)

    return new THREE.Vector3(x, y, z)
  }
}


class Scene {
  scene
  camera
  earth
  stars
  renderer
  controls
  HEIGHT
  WIDTH
  isMoveEarth = true

  constructor(
  ) {
    this.WIDTH = window.innerWidth
    this.HEIGHT = window.innerHeight

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(
      75,
      this.WIDTH / this.HEIGHT,
      0.1,
      1000,
    )
    this.earth = new Earth()
    this.renderer = new THREE.WebGLRenderer({ alpha: true }) //alpha = transparent
    this.controller = new OrbitControls(this.camera, this.renderer.domElement)
    this.stars = new Stars()
    this.createLight()
    this.createGeometry()
    this.createRenderer()
    this.trackControll()
    this.setResizeEvent()
    this.animate()
  }

  createLight()  {
    const ambientLight = new THREE.AmbientLight(0x888888)
    this.scene.add(ambientLight)
  }

  createGeometry() {
    this.scene.add(this.stars)
    
    this.scene.add(this.earth)
  }



  createRenderer() {
    this.renderer.setSize(this.WIDTH, this.HEIGHT)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true
    document.body.appendChild(this.renderer.domElement);
  }

  trackControll() {
    this.controller.minDistance = 180
    this.controller.maxDistance = 250
    this.controller.enablePan = false
    this.controller.enableZoom = true
    this.controller.enableDamping = true
    this.controller.minPolarAngle = 0.7
    this.controller.maxPolarAngle = 1.4
    this.controller.dampingFactor = 0.17
    this.controller.rotateSpeed = 0.17
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate()
    })
    if (this.isMoveEarth) this.earth.update()
    this.stars.update()
    this.controller.update()
    this.renderer.render(this.scene, this.camera)
  }

  handleMouseMove = (event) => {
    if (this.isOnCountryPoint || this.isClosingCountryInfo) return
    const initializedMousePos = Common.getInitializedMousePosByMouseEvent(event)
    const intersects = this.getObjOnMouse(initializedMousePos)
    if (intersects.length > 0) {
      this.verifyOnCountryPoint(intersects)
    }
  }


  setResizeEvent() {
  }
}





const scene = new Scene()