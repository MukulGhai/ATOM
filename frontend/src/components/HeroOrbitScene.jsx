import { useEffect, useRef } from 'react'

export default function HeroOrbitScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    let cancelled = false
    let cleanup = () => {}

    async function initScene() {
      const THREE = await import('three')
      if (cancelled || !mountRef.current) return

      const activeMount = mountRef.current
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
      camera.position.set(0, 0.72, 10.9)

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.5))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.08
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      activeMount.appendChild(renderer.domElement)

      const root = new THREE.Group()
      root.rotation.x = -0.08
      root.rotation.y = -0.24
      root.scale.setScalar(0.9)
      scene.add(root)

      const disposeItems = []
      const materialCache = []

      const register = (mesh) => {
        disposeItems.push(mesh)
        return mesh
      }

      const makeMaterial = (options) => {
        const material = new THREE.MeshPhysicalMaterial(options)
        materialCache.push(material)
        return material
      }

      scene.add(new THREE.AmbientLight(0xffffff, 1.25))

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.4)
      keyLight.position.set(4, 7, 6)
      keyLight.castShadow = true
      scene.add(keyLight)

      const tealLight = new THREE.PointLight(0x2dd4bf, 2.4, 18)
      tealLight.position.set(-4.5, -1.4, 5)
      scene.add(tealLight)

      const blueLight = new THREE.PointLight(0x3b82f6, 2.2, 16)
      blueLight.position.set(4, 1.5, 4)
      scene.add(blueLight)

      const panelMaterial = makeMaterial({
        color: 0x0f172a,
        metalness: 0.18,
        roughness: 0.32,
        clearcoat: 0.6,
        clearcoatRoughness: 0.34,
      })
      const panelFaceMaterial = makeMaterial({
        color: 0xf8fafc,
        metalness: 0.04,
        roughness: 0.5,
        clearcoat: 0.35,
      })
      const railMaterial = makeMaterial({
        color: 0x0f766e,
        metalness: 0.35,
        roughness: 0.28,
        emissive: 0x083f3b,
        emissiveIntensity: 0.28,
      })
      const blueMaterial = makeMaterial({
        color: 0x2563eb,
        metalness: 0.24,
        roughness: 0.3,
        emissive: 0x0d2a73,
        emissiveIntensity: 0.22,
      })
      const amberMaterial = makeMaterial({
        color: 0xf59e0b,
        metalness: 0.2,
        roughness: 0.34,
        emissive: 0x6b3600,
        emissiveIntensity: 0.15,
      })
      const mutedMaterial = makeMaterial({
        color: 0xdbeafe,
        metalness: 0.02,
        roughness: 0.6,
      })
      const darkLineMaterial = new THREE.LineBasicMaterial({ color: 0x1e3a8a, transparent: true, opacity: 0.24 })
      const brightLineMaterial = new THREE.LineBasicMaterial({ color: 0x2dd4bf, transparent: true, opacity: 0.64 })

      const createRoundedBoxGeometry = (width, height, depth, radius = 0.07) => {
        const x0 = -width / 2
        const y0 = -height / 2
        const x1 = width / 2
        const y1 = height / 2
        const r = Math.max(0.005, Math.min(radius, width / 2 - 0.005, height / 2 - 0.005))
        const bevel = Math.min(r * 0.42, depth * 0.32)
        const shape = new THREE.Shape()

        shape.moveTo(x0 + r, y0)
        shape.lineTo(x1 - r, y0)
        shape.quadraticCurveTo(x1, y0, x1, y0 + r)
        shape.lineTo(x1, y1 - r)
        shape.quadraticCurveTo(x1, y1, x1 - r, y1)
        shape.lineTo(x0 + r, y1)
        shape.quadraticCurveTo(x0, y1, x0, y1 - r)
        shape.lineTo(x0, y0 + r)
        shape.quadraticCurveTo(x0, y0, x0 + r, y0)

        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth,
          bevelEnabled: true,
          bevelSegments: 7,
          bevelSize: bevel,
          bevelThickness: bevel,
          curveSegments: 10,
        })
        geometry.center()
        geometry.computeVertexNormals()
        return geometry
      }

      const createBox = ({
        size,
        position,
        material,
        rotation = [0, 0, 0],
        castShadow = true,
        receiveShadow = false,
        radius = 0.07,
      }) => {
        const mesh = register(new THREE.Mesh(createRoundedBoxGeometry(size[0], size[1], size[2], radius), material))
        mesh.position.set(...position)
        mesh.rotation.set(...rotation)
        mesh.castShadow = castShadow
        mesh.receiveShadow = receiveShadow
        root.add(mesh)
        return mesh
      }

      const board = createBox({
        size: [5.25, 3.15, 0.24],
        position: [0, 0, 0],
        material: panelMaterial,
        receiveShadow: true,
        radius: 0.18,
      })

      createBox({
        size: [4.98, 2.86, 0.08],
        position: [0, 0, 0.18],
        material: panelFaceMaterial,
        receiveShadow: true,
        radius: 0.15,
      })

      createBox({ size: [4.55, 0.12, 0.1], position: [0, 1.2, 0.28], material: mutedMaterial, radius: 0.04 })
      createBox({ size: [1.05, 0.16, 0.12], position: [-1.66, 1.2, 0.38], material: blueMaterial, radius: 0.04 })
      createBox({ size: [0.62, 0.16, 0.12], position: [-0.73, 1.2, 0.38], material: railMaterial, radius: 0.04 })
      createBox({ size: [0.42, 0.16, 0.12], position: [1.95, 1.2, 0.38], material: amberMaterial, radius: 0.04 })

      const cards = [
        { x: -1.58, y: 0.5, w: 1.34, h: 0.72, material: blueMaterial, fill: 0.78 },
        { x: 0, y: 0.5, w: 1.34, h: 0.72, material: railMaterial, fill: 0.64 },
        { x: 1.58, y: 0.5, w: 1.34, h: 0.72, material: amberMaterial, fill: 0.46 },
      ]
      const progressBars = []

      cards.forEach((card, index) => {
        createBox({
          size: [card.w, card.h, 0.1],
          position: [card.x, card.y, 0.34],
          material: mutedMaterial,
          radius: 0.1,
        })
        createBox({
          size: [0.32, 0.32, 0.11],
          position: [card.x - card.w / 2 + 0.27, card.y + 0.16, 0.45],
          material: card.material,
          radius: 0.06,
        })
        createBox({
          size: [0.62, 0.08, 0.1],
          position: [card.x + 0.18, card.y + 0.18, 0.45],
          material: panelMaterial,
          radius: 0.025,
        })
        createBox({
          size: [0.96, 0.06, 0.08],
          position: [card.x + 0.06, card.y - 0.11, 0.45],
          material: panelFaceMaterial,
          radius: 0.025,
        })
        const bar = createBox({
          size: [0.96 * card.fill, 0.08, 0.1],
          position: [card.x - (0.96 * (1 - card.fill)) / 2 + 0.06, card.y - 0.11, 0.53],
          material: card.material,
          radius: 0.025,
        })
        bar.userData = { baseScaleX: 1, phase: index * 0.7 }
        progressBars.push(bar)
      })

      const columnHeights = [0.48, 0.84, 0.62, 1.08, 0.76, 1.22, 0.9]
      const columns = []
      columnHeights.forEach((height, index) => {
        const x = -1.98 + index * 0.66
        createBox({
          size: [0.28, 1.22, 0.06],
          position: [x, -0.62, 0.35],
          material: mutedMaterial,
          radius: 0.04,
        })
        const column = createBox({
          size: [0.28, height, 0.12],
          position: [x, -1.23 + height / 2, 0.48],
          material: index % 3 === 0 ? blueMaterial : index % 3 === 1 ? railMaterial : amberMaterial,
          radius: 0.05,
        })
        column.userData = { baseY: column.position.y, baseScaleY: 1, phase: index * 0.42 }
        columns.push(column)
      })

      const floatingTiles = [
        { position: [-3.16, 0.72, 0.88], size: [1.22, 0.64, 0.16], material: panelMaterial },
        { position: [3.15, 0.16, 0.95], size: [1.28, 0.7, 0.16], material: panelMaterial },
        { position: [-2.62, -1.44, 0.84], size: [1.34, 0.72, 0.16], material: panelMaterial },
        { position: [2.82, -1.32, 0.82], size: [1.08, 0.62, 0.16], material: panelMaterial },
      ]

      const floatingGroups = []
      floatingTiles.forEach((tile, index) => {
        const tileMesh = createBox({
          size: tile.size,
          position: tile.position,
          material: tile.material,
          radius: 0.11,
        })
        tileMesh.userData = { baseY: tile.position[1], phase: index * 0.82 }
        floatingGroups.push(tileMesh)

        createBox({
          size: [tile.size[0] - 0.28, 0.08, 0.07],
          position: [tile.position[0], tile.position[1] + 0.16, tile.position[2] + 0.13],
          material: index % 2 ? railMaterial : blueMaterial,
          castShadow: false,
          radius: 0.025,
        })
        createBox({
          size: [tile.size[0] * 0.52, 0.06, 0.06],
          position: [tile.position[0] - tile.size[0] * 0.1, tile.position[1] - 0.12, tile.position[2] + 0.13],
          material: mutedMaterial,
          castShadow: false,
          radius: 0.025,
        })
      })

      const createLine = (from, to, material = darkLineMaterial) => {
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(...from),
          new THREE.Vector3(...to),
        ])
        const line = new THREE.Line(geometry, material)
        root.add(line)
        disposeItems.push(line)
        return line
      }

      createLine([-2.4, 0.9, 0.55], [-3.16, 0.72, 0.88], brightLineMaterial)
      createLine([2.35, 0.15, 0.55], [3.15, 0.16, 0.95], brightLineMaterial)
      createLine([-2.2, -1.1, 0.55], [-2.62, -1.44, 0.84])
      createLine([2.12, -1.02, 0.55], [2.82, -1.32, 0.82])

      const routePoints = [
        new THREE.Vector3(-1.95, -1.55, 0.68),
        new THREE.Vector3(-1.1, -0.9, 0.74),
        new THREE.Vector3(-0.18, -1.1, 0.76),
        new THREE.Vector3(0.78, -0.42, 0.82),
        new THREE.Vector3(1.7, -0.65, 0.78),
      ]
      const routeGeometry = new THREE.BufferGeometry().setFromPoints(routePoints)
      const routeLine = new THREE.Line(routeGeometry, brightLineMaterial)
      root.add(routeLine)
      disposeItems.push(routeLine)

      const statusPins = []
      routePoints.forEach((point, index) => {
        const pin = createBox({
          size: [0.16, 0.16, 0.16],
          position: [point.x, point.y, point.z + 0.06],
          material: index % 2 ? railMaterial : blueMaterial,
          radius: 0.035,
        })
        pin.rotation.z = Math.PI / 4
        pin.userData = { baseY: pin.position.y, phase: index * 0.35 }
        statusPins.push(pin)
      })

      const grid = new THREE.GridHelper(8, 16, 0x93c5fd, 0xcbd5e1)
      grid.position.set(0, -2.18, -0.55)
      grid.rotation.x = Math.PI / 2
      grid.material.transparent = true
      grid.material.opacity = 0.24
      root.add(grid)

      const resize = () => {
        const width = activeMount.clientWidth || 1
        const height = activeMount.clientHeight || 1
        camera.aspect = width / height
        camera.updateProjectionMatrix()
        renderer.setSize(width, height, false)
      }

      resize()
      const resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(activeMount)

      let frameId
      const clock = new THREE.Clock()
      const render = () => {
        const elapsed = clock.getElapsedTime()

        if (!prefersReducedMotion) {
          root.rotation.y = -0.24 + Math.sin(elapsed * 0.28) * 0.08
          root.rotation.x = -0.08 + Math.sin(elapsed * 0.42) * 0.035
          root.position.y = Math.sin(elapsed * 0.55) * 0.08
          board.rotation.z = Math.sin(elapsed * 0.24) * 0.01

          progressBars.forEach((bar) => {
            bar.scale.x = 0.96 + Math.sin(elapsed * 1.5 + bar.userData.phase) * 0.04
          })

          columns.forEach((column) => {
            column.scale.y = 0.96 + Math.sin(elapsed * 1.1 + column.userData.phase) * 0.045
            column.position.y = column.userData.baseY + (column.scale.y - 1) * 0.34
          })

          floatingGroups.forEach((tile) => {
            tile.position.y = tile.userData.baseY + Math.sin(elapsed * 0.8 + tile.userData.phase) * 0.09
            tile.rotation.z = Math.sin(elapsed * 0.55 + tile.userData.phase) * 0.025
          })

          statusPins.forEach((pin) => {
            pin.position.y = pin.userData.baseY + Math.sin(elapsed * 1.8 + pin.userData.phase) * 0.035
            pin.rotation.z += 0.01
          })
        }

        renderer.render(scene, camera)
        frameId = window.requestAnimationFrame(render)
      }

      render()

      cleanup = () => {
        window.cancelAnimationFrame(frameId)
        resizeObserver.disconnect()
        if (activeMount.contains(renderer.domElement)) {
          activeMount.removeChild(renderer.domElement)
        }
        disposeItems.forEach((item) => {
          if (item.geometry) item.geometry.dispose()
        })
        materialCache.forEach(material => material.dispose())
        darkLineMaterial.dispose()
        brightLineMaterial.dispose()
        grid.geometry.dispose()
        grid.material.dispose()
        renderer.dispose()
      }
    }

    initScene()

    return () => {
      cancelled = true
      cleanup()
    }
  }, [])

  return (
    <div className="hero-3d-scene" aria-hidden="true">
      <div ref={mountRef} className="hero-3d-canvas" />
    </div>
  )
}
