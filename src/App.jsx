import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Skeleton from "./components/Skeleton";
import Scene from "./components/Scene";
import NavigationTree from "./components/NavigationTree";
import InfoPanel from "./components/InfoPanel";
import ControlPanel from "./components/ControlPanel";
import SearchBar from "./components/SearchBar";
import BoneLabels from "./components/BoneLabels";
import QuizMode from "./components/QuizMode";
import { BONES, REGIONS } from "./data/bonesData";

function CameraController({
  cameraTarget,
  cameraPosition,
  controlsRef,
  isAnimating,
}) {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 2, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 1, 0));

  useEffect(() => {
    if (cameraPosition) {
      targetCamPos.current.set(...cameraPosition);
    }
    if (cameraTarget) {
      targetLookAt.current.set(...cameraTarget);
    }
  }, [cameraPosition, cameraTarget]);

  useFrame(() => {
    if (isAnimating || cameraPosition || cameraTarget) {
      camera.position.lerp(targetCamPos.current, 0.08);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
      }
    }
  });

  return null;
}

function CameraControllerWrapper({
  cameraTarget,
  cameraPosition,
  controlsRef,
  isAnimating,
}) {
  return (
    <CameraController
      cameraTarget={cameraTarget}
      cameraPosition={cameraPosition}
      controlsRef={controlsRef}
      isAnimating={isAnimating}
    />
  );
}

function SceneContent({
  selectedBone,
  highlightedRegion,
  onSelectBone,
  explodeFactor,
  visibleRegions,
  showLabels,
  quizBones,
  cameraTarget,
  cameraPosition,
  controlsRef,
  autoRotate,
  isAnimating,
}) {
  return (
    <>
      <Scene />
      <Skeleton
        selectedBone={selectedBone}
        highlightedRegion={highlightedRegion}
        onSelectBone={onSelectBone}
        explodeFactor={explodeFactor}
        visibleRegions={visibleRegions}
        quizBones={quizBones}
      />
      <BoneLabels visible={showLabels} explodeFactor={explodeFactor} />
      <CameraControllerWrapper
        cameraTarget={cameraTarget}
        cameraPosition={cameraPosition}
        controlsRef={controlsRef}
        isAnimating={isAnimating}
      />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={25}
        target={[0, 1, 0]}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
      />
    </>
  );
}

export default function App() {
  const [selectedBone, setSelectedBone] = useState(null);
  const [highlightedRegion, setHighlightedRegion] = useState(null);
  const [visibleRegions, setVisibleRegions] = useState(
    Object.keys(REGIONS).map((key) => REGIONS[key].id),
  );
  const [explodeFactor, setExplodeFactor] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [cameraTarget, setCameraTarget] = useState(null);
  const [cameraPosition, setCameraPosition] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizBones, setQuizBones] = useState({});

  const controlsRef = useRef();
  const quizAnswerHandler = useRef(null);
  const animTimeoutRef = useRef(null);

  const selectedBoneData = BONES.find((b) => b.id === selectedBone);

  const clearAnimTimeout = () => {
    if (animTimeoutRef.current) {
      clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
  };

  const triggerAnimation = () => {
    clearAnimTimeout();
    setIsAnimating(true);
    animTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 1500);
  };

  const handleSelectBone = useCallback(
    (boneId) => {
      if (quizActive && quizAnswerHandler.current) {
        const answered = quizAnswerHandler.current(boneId);
        if (answered) return;
      }

      if (!quizActive) {
        setSelectedBone(boneId);
        const bone = BONES.find((b) => b.id === boneId);
        if (bone) {
          const target = [...bone.position];
          const position = [
            bone.position[0] + 2.5,
            bone.position[1] + 0.5,
            bone.position[2] + 4,
          ];
          setCameraTarget(target);
          setCameraPosition(position);
          setHighlightedRegion(bone.region);
          triggerAnimation();
        }
      }
    },
    [quizActive],
  );

  const handleSelectRegion = useCallback((regionId) => {
    setHighlightedRegion(regionId);
    setSelectedBone(null);

    const regionBones = BONES.filter((b) => b.region === regionId);
    if (regionBones.length > 0) {
      const centerPos = regionBones
        .reduce(
          (acc, b) => [
            acc[0] + b.position[0],
            acc[1] + b.position[1],
            acc[2] + b.position[2],
          ],
          [0, 0, 0],
        )
        .map((v) => v / regionBones.length);
      setCameraTarget(centerPos);
      setCameraPosition([centerPos[0] + 3, centerPos[1] + 1, centerPos[2] + 6]);
      triggerAnimation();
    }
  }, []);

  const handleToggleRegion = useCallback((regionId) => {
    setVisibleRegions((prev) =>
      prev.includes(regionId)
        ? prev.filter((r) => r !== regionId)
        : [...prev, regionId],
    );
  }, []);

  const handleSetView = useCallback((position, target) => {
    setCameraTarget([...target]);
    setCameraPosition([...position]);
    triggerAnimation();
  }, []);

  const handleShowAll = useCallback(() => {
    setVisibleRegions(Object.keys(REGIONS).map((key) => REGIONS[key].id));
  }, []);

  const handleHideAll = useCallback(() => {
    setVisibleRegions([]);
  }, []);

  const handleStartQuiz = useCallback(() => {
    setQuizActive((prev) => !prev);
    setQuizBones({});
    if (quizActive) {
      setSelectedBone(null);
      setHighlightedRegion(null);
    }
  }, [quizActive]);

  const handleCloseInfoPanel = useCallback(() => {
    setSelectedBone(null);
    setHighlightedRegion(null);
    setCameraTarget(null);
    setCameraPosition(null);
  }, []);

  const handleQuizQuestionGenerated = useCallback((bone) => {
    if (bone) {
      setCameraTarget([...bone.position]);
      setCameraPosition([
        bone.position[0] + 3,
        bone.position[1] + 1,
        bone.position[2] + 5,
      ]);
      triggerAnimation();
    }
  }, []);

  return (
    <div className="app-container">
      <div className="top-bar">
        <div className="app-title">
          <span className="app-title-icon">🦴</span>
          <div>
            <div>人体骨骼系统</div>
            <div className="app-title-sub">3D解剖学习平台</div>
          </div>
        </div>

        <div className="search-container">
          <SearchBar onSelectBone={handleSelectBone} />
        </div>
      </div>

      <div className="left-panel">
        <NavigationTree
          selectedBone={selectedBone}
          onSelectBone={handleSelectBone}
          onSelectRegion={handleSelectRegion}
          visibleRegions={visibleRegions}
          onToggleRegion={handleToggleRegion}
        />
      </div>

      <div className="main-content">
        <div className="canvas-container">
          <Canvas
            shadows
            camera={{ position: [0, 2, 10], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
            onCreated={({ gl, scene }) => {
              gl.setClearColor("#1a1a2e");
              scene.background = new THREE.Color("#1a1a2e");
            }}
          >
            <fog attach="fog" args={["#1a1a2e", 15, 30]} />

            <SceneContent
              selectedBone={selectedBone}
              highlightedRegion={highlightedRegion}
              onSelectBone={handleSelectBone}
              explodeFactor={explodeFactor}
              visibleRegions={visibleRegions}
              showLabels={showLabels}
              quizBones={quizBones}
              cameraTarget={cameraTarget}
              controlsRef={controlsRef}
              autoRotate={autoRotate}
            />
          </Canvas>

          {selectedBoneData && !quizActive && (
            <div className="info-panel-container">
              <InfoPanel
                bone={selectedBoneData}
                onClose={handleCloseInfoPanel}
              />
            </div>
          )}
        </div>
      </div>

      <div className="right-panel">
        <ControlPanel
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate((prev) => !prev)}
          onSetView={handleSetView}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels((prev) => !prev)}
          explodeFactor={explodeFactor}
          onExplodeChange={setExplodeFactor}
          showAll={handleShowAll}
          hideAll={handleHideAll}
          onStartQuiz={handleStartQuiz}
          quizActive={quizActive}
        />
      </div>

      <QuizMode
        active={quizActive}
        onBoneSelect={quizAnswerHandler}
        quizBones={quizBones}
        setQuizBones={setQuizBones}
        onClose={handleStartQuiz}
        onQuestionGenerated={handleQuizQuestionGenerated}
      />
    </div>
  );
}