import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { BONES, REGIONS, EXPLODE_OFFSETS } from "../data/bonesData";

const BONE_COLOR = "#F5F5DC";

function Bone({
  bone,
  selected,
  highlighted,
  onSelect,
  explodeFactor,
  visible,
  quizState,
}) {
  const groupRef = useRef();
  const meshRefs = useRef([]);

  const regionColor = REGIONS[bone.region.toUpperCase()]?.color || "#ffffff";

  const explodeOffset = useMemo(() => {
    const base = EXPLODE_OFFSETS[bone.region] || [0, 0, 0];
    const sideFactor = bone.id.includes("_l")
      ? -1
      : bone.id.includes("_r")
        ? 1
        : 0;
    const xOffset =
      bone.region === "upper_limb"
        ? sideFactor * base[0]
        : bone.region === "lower_limb"
          ? sideFactor * base[0]
          : base[0];
    return [xOffset, base[1], base[2]];
  }, [bone.region, bone.id]);

  const targetPosition = useMemo(() => {
    return [
      bone.position[0] + explodeOffset[0] * explodeFactor,
      bone.position[1] + explodeOffset[1] * explodeFactor,
      bone.position[2] + explodeOffset[2] * explodeFactor,
    ];
  }, [bone.position, explodeOffset, explodeFactor]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(new THREE.Vector3(...targetPosition), 0.1);
    }

    let color = BONE_COLOR;
    let emissive = "#000000";
    let emissiveIntensity = 0;
    let opacity = visible ? 0.9 : 0.15;
    let transparent = !visible;

    if (quizState === "correct") {
      color = "#4CAF50";
      emissive = "#4CAF50";
      emissiveIntensity = 0.5;
      opacity = 1;
      transparent = false;
    } else if (quizState === "wrong") {
      color = "#F44336";
      emissive = "#F44336";
      emissiveIntensity = 0.5;
      opacity = 1;
      transparent = false;
    } else if (quizState === "highlight") {
      color = regionColor;
      emissive = regionColor;
      emissiveIntensity = 0.4;
      opacity = 1;
      transparent = false;
    } else if (selected) {
      color = regionColor;
      emissive = regionColor;
      emissiveIntensity = 0.6;
      opacity = 1;
      transparent = false;
    } else if (highlighted) {
      color = regionColor;
      emissive = regionColor;
      emissiveIntensity = 0.3;
      opacity = 1;
      transparent = false;
    } else if (!visible) {
      opacity = 0.1;
      transparent = true;
    }

    meshRefs.current.forEach((mesh) => {
      if (mesh && mesh.material) {
        mesh.material.color.set(color);
        mesh.material.emissive.set(emissive);
        mesh.material.emissiveIntensity = emissiveIntensity;
        mesh.material.opacity = opacity;
        mesh.material.transparent = transparent;
      }
    });
  });

  const handleClick = (e) => {
    e.stopPropagation();
    onSelect(bone.id);
  };

  const geometry = useMemo(() => createBoneGeometry(bone.id), [bone.id]);

  return (
    <group ref={groupRef} position={bone.position} onClick={handleClick}>
      {geometry.map((geom, idx) => (
        <mesh
          key={idx}
          ref={(el) => (meshRefs.current[idx] = el)}
          {...geom.props}
          castShadow
          receiveShadow
        >
          {geom.geometry}
          <meshStandardMaterial
            color={BONE_COLOR}
            roughness={0.5}
            metalness={0.1}
            transparent={!visible}
            opacity={visible ? 0.9 : 0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

function createBoneGeometry(boneId) {
  const geometries = [];

  switch (boneId) {
    case "frontal":
      geometries.push({
        props: { position: [0, 0.1, 0.2], rotation: [-0.15, 0, 0] },
        geometry: (
          <sphereGeometry
            args={[0.75, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.8]}
          />
        ),
      });
      geometries.push({
        props: { position: [-0.35, 0.15, 0.55], rotation: [-0.2, -0.15, 0] },
        geometry: (
          <sphereGeometry
            args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
        ),
      });
      geometries.push({
        props: { position: [0.35, 0.15, 0.55], rotation: [-0.2, 0.15, 0] },
        geometry: (
          <sphereGeometry
            args={[0.2, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]}
          />
        ),
      });
      geometries.push({
        props: { position: [0, 0.1, 0.65], rotation: [-0.3, 0, 0] },
        geometry: <boxGeometry args={[0.6, 0.12, 0.15]} />,
      });
      break;

    case "parietal_l":
    case "parietal_r": {
      const parietalX = boneId.includes("_l") ? -0.4 : 0.4;
      const rotZ = boneId.includes("_l") ? -0.25 : 0.25;
      geometries.push({
        props: {
          position: [parietalX, 0.25, -0.05],
          rotation: [0.05, 0, rotZ],
        },
        geometry: (
          <sphereGeometry
            args={[0.68, 32, 32, 0, Math.PI * 2, 0, Math.PI / 1.6]}
          />
        ),
      });
      geometries.push({
        props: { position: [parietalX * 1.3, 0.1, 0], rotation: [0, 0, rotZ] },
        geometry: <boxGeometry args={[0.15, 0.5, 0.6]} />,
      });
      break;
    }

    case "temporal_l":
    case "temporal_r": {
      const temporalX = boneId.includes("_l") ? -0.8 : 0.8;
      const rotZ = boneId.includes("_l") ? -0.2 : 0.2;
      geometries.push({
        props: { position: [temporalX, -0.25, 0.1], rotation: [0, 0, rotZ] },
        geometry: <sphereGeometry args={[0.4, 24, 24]} />,
      });
      geometries.push({
        props: {
          position: [temporalX * 1.1, -0.55, 0.25],
          rotation: [0.3, 0, rotZ * 1.5],
        },
        geometry: <cylinderGeometry args={[0.1, 0.12, 0.45, 12]} />,
      });
      geometries.push({
        props: { position: [temporalX, -0.5, 0.5], rotation: [0.2, 0, rotZ] },
        geometry: <cylinderGeometry args={[0.06, 0.08, 0.35, 8]} />,
      });
      break;
    }

    case "occipital":
      geometries.push({
        props: { position: [0, -0.05, -0.55], rotation: [-0.2, 0, 0] },
        geometry: <sphereGeometry args={[0.65, 32, 32]} />,
      });
      geometries.push({
        props: { position: [0, -0.45, -0.4], rotation: [0.1, 0, 0] },
        geometry: <cylinderGeometry args={[0.22, 0.26, 0.2, 16]} />,
      });
      geometries.push({
        props: { position: [0, -0.6, -0.35], rotation: [0.3, 0, 0] },
        geometry: <cylinderGeometry args={[0.1, 0.18, 0.2, 16]} />,
      });
      break;

    case "mandible":
      geometries.push({
        props: { position: [0, -0.75, 0.2], rotation: [0.15, 0, 0] },
        geometry: <torusGeometry args={[0.48, 0.15, 14, 36, Math.PI]} />,
      });
      geometries.push({
        props: { position: [0, -0.6, 0.45], rotation: [0.1, 0, 0] },
        geometry: <boxGeometry args={[0.75, 0.18, 0.15]} />,
      });
      geometries.push({
        props: { position: [-0.4, -0.95, 0.1], rotation: [0.35, 0.2, -0.15] },
        geometry: <boxGeometry args={[0.12, 0.45, 0.18]} />,
      });
      geometries.push({
        props: { position: [0.4, -0.95, 0.1], rotation: [0.35, -0.2, 0.15] },
        geometry: <boxGeometry args={[0.12, 0.45, 0.18]} />,
      });
      geometries.push({
        props: { position: [-0.22, -0.55, 0.45], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />,
      });
      geometries.push({
        props: { position: [-0.1, -0.55, 0.45], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />,
      });
      geometries.push({
        props: { position: [0.02, -0.55, 0.45], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />,
      });
      geometries.push({
        props: { position: [0.14, -0.55, 0.45], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />,
      });
      geometries.push({
        props: { position: [0.26, -0.55, 0.45], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />,
      });
      break;

    case "cervical":
      for (let i = 0; i < 7; i++) {
        geometries.push({
          props: {
            position: [0, -0.25 * i, -0.05 * i],
            rotation: [0.05 * i, 0, 0],
          },
          geometry: <cylinderGeometry args={[0.15, 0.18, 0.2, 12]} />,
        });
        geometries.push({
          props: {
            position: [0, -0.25 * i, -0.15 - 0.05 * i],
            rotation: [0.05 * i, 0, 0],
          },
          geometry: <boxGeometry args={[0.3, 0.05, 0.15]} />,
        });
      }
      break;

    case "thoracic":
      for (let i = 0; i < 12; i++) {
        geometries.push({
          props: {
            position: [0, -0.3 * i, -0.3 - 0.02 * i],
            rotation: [0, 0, 0],
          },
          geometry: <cylinderGeometry args={[0.18, 0.2, 0.25, 12]} />,
        });
        geometries.push({
          props: {
            position: [0, -0.3 * i, -0.45 - 0.02 * i],
            rotation: [0, 0, 0],
          },
          geometry: <boxGeometry args={[0.35, 0.06, 0.18]} />,
        });
      }
      break;

    case "lumbar":
      for (let i = 0; i < 5; i++) {
        geometries.push({
          props: {
            position: [0, -0.4 * i, -0.55],
            rotation: [0, 0, 0],
          },
          geometry: <cylinderGeometry args={[0.25, 0.28, 0.35, 12]} />,
        });
        geometries.push({
          props: {
            position: [0, -0.4 * i, -0.75],
            rotation: [0, 0, 0],
          },
          geometry: <boxGeometry args={[0.45, 0.08, 0.22]} />,
        });
      }
      break;

    case "sacrum":
      geometries.push({
        props: { position: [0, 0, -0.6], rotation: [0.3, 0, 0] },
        geometry: <cylinderGeometry args={[0.28, 0.35, 0.8, 12]} />,
      });
      geometries.push({
        props: { position: [0, -0.5, -0.5], rotation: [0.5, 0, 0] },
        geometry: <cylinderGeometry args={[0.15, 0.2, 0.4, 12]} />,
      });
      break;

    case "sternum":
      geometries.push({
        props: { position: [0, 0.5, 0], rotation: [0, 0, 0] },
        geometry: <boxGeometry args={[0.15, 0.5, 0.1]} />,
      });
      geometries.push({
        props: { position: [0, -0.2, 0], rotation: [0, 0, 0] },
        geometry: <boxGeometry args={[0.2, 0.8, 0.1]} />,
      });
      geometries.push({
        props: { position: [0, -0.9, 0], rotation: [0, 0, 0] },
        geometry: <boxGeometry args={[0.15, 0.3, 0.08]} />,
      });
      break;

    case "ribs_l":
    case "ribs_r":
      const ribSide = boneId.includes("_l") ? -1 : 1;
      for (let i = 0; i < 12; i++) {
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(ribSide * 0.25, -0.3 * i, -0.4),
          new THREE.Vector3(ribSide * 0.8, -0.3 * i, 0),
          new THREE.Vector3(ribSide * 0.9, -0.3 * i, 0.5),
          new THREE.Vector3(ribSide * 0.5, -0.3 * i, 1.0),
          new THREE.Vector3(ribSide * 0.15, -0.3 * i, 1.2),
        ]);
        geometries.push({
          props: { position: [0, 0, 0], rotation: [0, 0, 0] },
          geometry: <tubeGeometry args={[curve, 20, 0.06, 8, false]} />,
        });
      }
      break;

    case "clavicle_l":
    case "clavicle_r":
      const clavSide = boneId.includes("_l") ? -1 : 1;
      const clavCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(clavSide * 0.1, 0, 0.8),
        new THREE.Vector3(clavSide * 0.4, 0.1, 0.6),
        new THREE.Vector3(clavSide * 0.7, 0.15, 0.3),
      ]);
      geometries.push({
        props: { position: [0, 0, 0], rotation: [0, 0, 0] },
        geometry: <tubeGeometry args={[clavCurve, 12, 0.08, 8, false]} />,
      });
      break;

    case "scapula_l":
    case "scapula_r":
      const scapSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [scapSide * 0.1, 0, -0.2],
          rotation: [0, scapSide * 0.2, scapSide * 0.1],
        },
        geometry: <boxGeometry args={[0.15, 0.9, 0.7]} />,
      });
      geometries.push({
        props: {
          position: [scapSide * 0.3, 0.3, 0.15],
          rotation: [0, scapSide * 0.3, scapSide * 0.2],
        },
        geometry: <boxGeometry args={[0.4, 0.15, 0.3]} />,
      });
      geometries.push({
        props: {
          position: [scapSide * 0.2, -0.1, 0.25],
          rotation: [0.3, 0, 0],
        },
        geometry: <cylinderGeometry args={[0.1, 0.12, 0.3, 12]} />,
      });
      break;

    case "humerus_l":
    case "humerus_r":
      const humSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [humSide * 0.1, -0.1, 0],
          rotation: [0.1, 0, humSide * 0.15],
        },
        geometry: <sphereGeometry args={[0.15, 16, 16]} />,
      });
      geometries.push({
        props: {
          position: [humSide * 0.1, -0.8, 0],
          rotation: [0.1, 0, humSide * 0.15],
        },
        geometry: <cylinderGeometry args={[0.08, 0.1, 1.3, 12]} />,
      });
      geometries.push({
        props: {
          position: [humSide * 0.1, -1.5, 0],
          rotation: [0.1, 0, humSide * 0.15],
        },
        geometry: <boxGeometry args={[0.25, 0.15, 0.15]} />,
      });
      break;

    case "ulna_l":
    case "ulna_r":
      const ulnaSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [ulnaSide * 0.15, -0.1, 0],
          rotation: [0.1, 0, ulnaSide * 0.1],
        },
        geometry: <boxGeometry args={[0.12, 0.2, 0.15]} />,
      });
      geometries.push({
        props: {
          position: [ulnaSide * 0.15, -0.8, 0],
          rotation: [0.1, 0, ulnaSide * 0.1],
        },
        geometry: <cylinderGeometry args={[0.06, 0.07, 1.2, 12]} />,
      });
      geometries.push({
        props: {
          position: [ulnaSide * 0.15, -1.45, 0],
          rotation: [0.1, 0, ulnaSide * 0.1],
        },
        geometry: <sphereGeometry args={[0.08, 12, 12]} />,
      });
      break;

    case "radius_l":
    case "radius_r":
      const radSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [radSide * 0.05, -0.1, 0],
          rotation: [0.1, 0, radSide * 0.05],
        },
        geometry: <sphereGeometry args={[0.09, 12, 12]} />,
      });
      geometries.push({
        props: {
          position: [radSide * 0.05, -0.8, 0],
          rotation: [0.1, 0, radSide * 0.05],
        },
        geometry: <cylinderGeometry args={[0.07, 0.08, 1.2, 12]} />,
      });
      geometries.push({
        props: {
          position: [radSide * 0.05, -1.45, 0],
          rotation: [0.1, 0, radSide * 0.05],
        },
        geometry: <boxGeometry args={[0.18, 0.12, 0.15]} />,
      });
      break;

    case "hand_l":
    case "hand_r":
      const handSide = boneId.includes("_l") ? -1 : 1;
      for (let i = 0; i < 5; i++) {
        geometries.push({
          props: {
            position: [handSide * (0.05 + i * 0.08), -0.15, 0.05],
            rotation: [0.2, 0, handSide * 0.1],
          },
          geometry: <boxGeometry args={[0.06, 0.15, 0.08]} />,
        });
      }
      for (let i = 0; i < 5; i++) {
        geometries.push({
          props: {
            position: [handSide * (0.05 + i * 0.08), -0.35, 0.05],
            rotation: [0.2, 0, handSide * 0.1],
          },
          geometry: <cylinderGeometry args={[0.03, 0.03, 0.25, 8]} />,
        });
        geometries.push({
          props: {
            position: [handSide * (0.05 + i * 0.08), -0.55, 0.05],
            rotation: [0.2, 0, handSide * 0.1],
          },
          geometry: <cylinderGeometry args={[0.025, 0.025, 0.2, 8]} />,
        });
      }
      break;

    case "hip_l":
    case "hip_r":
      const hipSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [hipSide * 0.2, 0.4, -0.1],
          rotation: [0.2, hipSide * 0.3, 0],
        },
        geometry: <boxGeometry args={[0.5, 0.6, 0.15]} />,
      });
      geometries.push({
        props: {
          position: [hipSide * 0.3, -0.1, -0.2],
          rotation: [0.3, hipSide * 0.2, hipSide * 0.1],
        },
        geometry: <boxGeometry args={[0.35, 0.5, 0.2]} />,
      });
      geometries.push({
        props: {
          position: [hipSide * 0.15, 0.2, 0.1],
          rotation: [0.2, hipSide * 0.3, 0],
        },
        geometry: <torusGeometry args={[0.18, 0.06, 8, 16]} />,
      });
      break;

    case "femur_l":
    case "femur_r":
      const femSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [femSide * 0.15, 0.2, 0],
          rotation: [0.2, 0, femSide * 0.1],
        },
        geometry: <sphereGeometry args={[0.18, 16, 16]} />,
      });
      geometries.push({
        props: {
          position: [femSide * 0.1, -0.6, 0],
          rotation: [0.15, 0, femSide * 0.08],
        },
        geometry: <cylinderGeometry args={[0.1, 0.12, 1.5, 12]} />,
      });
      geometries.push({
        props: {
          position: [femSide * 0.05, -1.4, 0.1],
          rotation: [0.1, 0, femSide * 0.05],
        },
        geometry: <boxGeometry args={[0.28, 0.18, 0.2]} />,
      });
      break;

    case "patella_l":
    case "patella_r":
      const patSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: { position: [patSide * 0.05, 0, 0.1], rotation: [0.3, 0, 0] },
        geometry: <cylinderGeometry args={[0.1, 0.12, 0.08, 12]} />,
      });
      break;

    case "tibia_l":
    case "tibia_r":
      const tibSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: { position: [tibSide * 0.05, -0.1, 0], rotation: [0, 0, 0] },
        geometry: <boxGeometry args={[0.25, 0.15, 0.18]} />,
      });
      geometries.push({
        props: { position: [tibSide * 0.05, -0.9, 0], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.09, 0.1, 1.4, 12]} />,
      });
      geometries.push({
        props: { position: [tibSide * 0.05, -1.65, 0], rotation: [0, 0, 0] },
        geometry: <boxGeometry args={[0.22, 0.12, 0.18]} />,
      });
      break;

    case "fibula_l":
    case "fibula_r":
      const fibSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: { position: [fibSide * 0.2, -0.15, 0], rotation: [0, 0, 0] },
        geometry: <sphereGeometry args={[0.07, 12, 12]} />,
      });
      geometries.push({
        props: { position: [fibSide * 0.2, -0.9, 0], rotation: [0, 0, 0] },
        geometry: <cylinderGeometry args={[0.04, 0.05, 1.4, 12]} />,
      });
      geometries.push({
        props: { position: [fibSide * 0.2, -1.65, 0], rotation: [0, 0, 0] },
        geometry: <sphereGeometry args={[0.08, 12, 12]} />,
      });
      break;

    case "foot_l":
    case "foot_r":
      const footSide = boneId.includes("_l") ? -1 : 1;
      geometries.push({
        props: {
          position: [footSide * 0.05, -0.15, 0.1],
          rotation: [0.2, 0, 0],
        },
        geometry: <boxGeometry args={[0.2, 0.15, 0.35]} />,
      });
      for (let i = 0; i < 5; i++) {
        geometries.push({
          props: {
            position: [footSide * (0.02 + i * 0.07), -0.25, 0.35],
            rotation: [0.3, 0, 0],
          },
          geometry: <cylinderGeometry args={[0.03, 0.03, 0.18, 8]} />,
        });
        geometries.push({
          props: {
            position: [footSide * (0.02 + i * 0.07), -0.3, 0.5],
            rotation: [0.3, 0, 0],
          },
          geometry: <cylinderGeometry args={[0.025, 0.025, 0.15, 8]} />,
        });
      }
      geometries.push({
        props: {
          position: [footSide * 0.05, -0.2, -0.1],
          rotation: [0.4, 0, 0],
        },
        geometry: <sphereGeometry args={[0.12, 12, 12]} />,
      });
      break;

    default:
      geometries.push({
        props: { position: [0, 0, 0] },
        geometry: <boxGeometry args={[0.2, 0.2, 0.2]} />,
      });
  }

  return geometries;
}

export default function Skeleton({
  selectedBone,
  highlightedRegion,
  onSelectBone,
  explodeFactor,
  visibleRegions,
  quizBones,
}) {
  return (
    <group>
      {BONES.map((bone) => {
        const visible = visibleRegions.includes(bone.region);
        const quizState = quizBones[bone.id] || null;

        return (
          <Bone
            key={bone.id}
            bone={bone}
            selected={selectedBone === bone.id}
            highlighted={highlightedRegion === bone.region}
            onSelect={onSelectBone}
            explodeFactor={explodeFactor}
            visible={visible}
            quizState={quizState}
          />
        );
      })}
    </group>
  );
}
