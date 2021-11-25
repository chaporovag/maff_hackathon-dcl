export class Crate extends Entity {
	isGrabbed: boolean = false
 
	constructor( transform: Transform) {
	  super()
	  engine.addEntity(this)
	  this.addComponent(new BoxShape() )
	  this.addComponent(transform)
	  
	  this.addComponent(
		 new OnPointerDown(
			() => {
			   if (!this.isGrabbed) {
					this.isGrabbed = true
			  
					// Calculates the crate's position relative to the camera
					transform.position = Vector3.Zero()
					transform.rotation = Quaternion.Zero()
					transform.position.z += 1.5
					this.setParent(Attachable.FIRST_PERSON_CAMERA)
				 } else {
					
				  //  putDownSound.getComponent(AudioSource).playOnce()
			  
					// Calculate crate's ground position
					
					let forwardVector: Vector3 = Vector3.Forward()
					  .scale(1.5)
					  .rotate(Camera.instance.rotation)
					transform.position = Camera.instance.position.clone().add(forwardVector)
					transform.lookAt(Camera.instance.position)
					transform.rotation.x = 0
					transform.rotation.z = 0
					let distance = Vector3.Down().scale(.1)
					transform.translate(distance)
					this.isGrabbed = false
					// transform.position.y = 0.5
					this.setParent(null) // Remove parent
				 }
			},
			{
			  button: ActionButton.PRIMARY,
			  hoverText: "Pick Up / Put Down",
			  distance: 5
			}
		 )
	  )
	}
 }