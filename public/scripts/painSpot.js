let tempPainSpots = new Array();
const savedPainSpots = new Array();

// **
// START INSERTION
// **
function startInsertion() {
  canvas.classList.add('inserting-pain-spot');
  renderer.domElement.addEventListener('click', handleInsertion);
}

// **
// HANDLE INSERTION
// **
function handleInsertion(event) {
  const result = addMark(event.clientX, event.clientY);

  canvas.classList.remove('inserting-pain-spot');
  renderer.domElement.removeEventListener('click', handleInsertion);

  // store insertion
  if(result.success){
    const ps = {
      position: result.position,
      boneName: result.boneName,
      bodyPart: painSpotSettings.bodyPart,
      movement: painSpotSettings.movement,
    }
    tempPainSpots.push(ps);
  }
}

// **
// ADD PAIN MARK
// **
function addMark(x, y) {
  
  let mouse = new THREE.Vector2();
  mouse.x = ( x / w ) * 2 - 1;
	mouse.y = - ( y / h ) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  
  const map = new THREE.TextureLoader().load('/textures/spark1.png');
  var spriteMat = new THREE.SpriteMaterial({
    map: map,
    color: 'red',
  });

  let intersects = raycaster.intersectObject(myModel.model.children[0].children[1]);
  if (intersects.length < 1){
    return {
      success: false,
    };
  }

  let intersection = intersects[0];
  let pIntersect = intersection.point.clone();
  // pIntersect from global to local (mesh)
  myModel.model.children[0].children[1].worldToLocal(pIntersect);

  let sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.5, 0.5, 0.5);
  sprite.position.add(pIntersect);
  
  const distances = calculateDistances(myModel.modelSkeleton.bones, intersection.point); // intersection.point => world position
  const minIndex = distances.indexOf(Math.min(...distances)) + 1; // index of the nearest bone
  const boneName = myModel.modelSkeleton.bones[minIndex].name;
  console.log(boneName);
  myModel.modelSkeleton.getBoneByName(boneName).attach(sprite);

  return {
    success: true,
    boneName: boneName,
    position: pIntersect,
  };
}

//**
// REMOVE LAST INSERTED PAIN MARK 
//**
function removeLastMark() {
  if(tempPainSpots.length > 0) {
    const removedPs = tempPainSpots.pop();
    myModel.modelSkeleton.getBoneByName(removedPs.boneName).children.pop();
  } else {
    alert('No more pain spots');
  }
}

//**
// SAVE
//**
function savePs() {
  if(tempPainSpots.length > 0) {
    savedPainSpots.push(Array.from(tempPainSpots));
    for(i=0; i<=tempPainSpots.length; i++) {
      const removedPs = tempPainSpots.pop();
      myModel.modelSkeleton.getBoneByName(removedPs.boneName).children.pop();
    }
    tempPainSpots = [];
  } else {
    alert('No pain spots')
  }
}
