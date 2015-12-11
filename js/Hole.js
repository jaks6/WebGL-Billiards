var Hole = function (x, y, z) {
  // The "wall" arch
  this.arch1 = new Arch({
    position : {x:x, y:y, z:z},
    no_of_boxes : 6,
    box_height : 6,
    box_autowidth : true,
    box_thickness : 0.1
  });
  // the "floor" arch
  this.arch2 = new Arch({
    position : {x:x, y:y-3, z:z},
    no_of_boxes : 6,
    box_height : 3,
    box_width : 1.5,
    box_thickness : 2
  });
  this.arch2.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 2*Math.PI);

  world.addBody(this.arch1.body);
  addCannonVisual(this.arch1.body);

  world.addBody(this.arch2.body);
  addCannonVisual(this.arch2.body);

};