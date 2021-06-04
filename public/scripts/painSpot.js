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

  let sprite = createSprite(pIntersect);
  
  const { minIndex } = calculateDistances(myModel.modelSkeleton.bones, intersection.point); // intersection.point => world position
  const boneName = myModel.modelSkeleton.bones[minIndex].name;
  attachSpriteToBone(sprite, boneName);

  return {
    success: true,
    boneName: boneName,
    position: pIntersect,
  };
}

//**
// ADD SPRITE TO BONE
//**
function attachSpriteToBone(sprite, boneName) {
  myModel.modelSkeleton.getBoneByName(boneName).attach(sprite);
}

//**
// CREATE SPRITE
//**
function createSprite(localPosition) {
  const map = new THREE.TextureLoader().load('/textures/spark1.png');
  var spriteMat = new THREE.SpriteMaterial({
    map: map,
    color: 'red',
  });

  let sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(0.5, 0.5, 0.5);
  sprite.position.add(localPosition);

  return sprite;
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
    updatePsCount();
    for(i=0; i<=tempPainSpots.length; i++) {
      const removedPs = tempPainSpots.pop();
      myModel.modelSkeleton.getBoneByName(removedPs.boneName).children.pop();
    }
    tempPainSpots = [];
  } else {
    alert('No pain spots')
  }
}

//**
// UPDATE PAIN SPOT LIST
//**
function updatePsCount(){
  viewPainSpotSettings.total++;
  const psName = 'Pain Spot ' + (viewPainSpotSettings.total);
  viewPainSpotSettings.painSpotList.push(psName);
  viewPainSpotSettings.selectPainSpot = viewPainSpotSettings.painSpotList[0];
  updatePsViewController();
}

function discardUnsavedChanges() {
  if(tempPainSpots.length > 0) {
    // discard unsaved changes
    for(i=0; i<tempPainSpots.length; i++) {
      removeLastMark();
    }
  }
}

//**
// MANAGE VIEWING MODE
//**
function startViewingMode() {
  if(viewPainSpotSettings.isViewing === true) {
    quitViewingMode();
  }

  if(!viewPainSpotSettings.selectPainSpot) {
    alert('Select pain spot!')
  } else {
    viewPainSpotSettings.isViewing = true;
    discardUnsavedChanges();
    remakePainSpot();
  }
}
function quitViewingMode() {
  removePainSpot();
  viewPainSpotSettings.isViewing = false;
}

//**
// RE-INSERT A SAVED PAIN SPOT
//**
function remakePainSpot() {
  const selectedIndex = viewPainSpotSettings.painSpotList.indexOf(viewPainSpotSettings.selectPainSpot);
  const ps = savedPainSpots[selectedIndex];

  viewPainSpotSettings.actualIndex = selectedIndex;
  let sprite;
  
  ps.forEach(painMark => {
    sprite = createSprite(painMark.position);
    attachSpriteToBone(sprite, painMark.boneName);
  });
}

//**
// REMOVE ALL PAIN MARKS
//**
function removePainSpot() {
  if(viewPainSpotSettings.isViewing) {
    const ps = savedPainSpots[viewPainSpotSettings.actualIndex];
    let bone;
    ps.forEach(painMark => {
      bone = myModel.modelSkeleton.getBoneByName(painMark.boneName);
      bone.children.forEach((object, index) => {
        if(object.type === "Sprite") {
          bone.children.splice(index, 1);
        }
      });
    });
  }
}