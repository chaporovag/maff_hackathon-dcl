import BaseEntity from "./base/baseEntity";
import Global from "../core/global";
import * as ui from "@dcl/ui-scene-utils";
import Robot, {Move, Rotate} from "./robot";
import Key from "./key";
import resources from "../resources";
import global from "../core/global";

class TerminalButton extends BaseEntity {
	
  constructor(transform: TransformConstructorArgs) {
    super(new GLTFShape(resources.MODEL_TERMINAL_BTN), transform);
  }
}

class TerminalCard extends BaseEntity {
  constructor(transform: TransformConstructorArgs) {
    super(new GLTFShape(resources.MODEL_TERMINAL_CARD), transform);
  }

  public setVisible(value: boolean) {
    if (value) {
      this.getComponent(Transform).scale.setAll(1)
    } else {
      this.getComponent(Transform).scale.setAll(0)
    }
  }
}

export default class Terminal extends BaseEntity {
  private readonly _moveFwdBtn: TerminalButton
  private readonly _moveBackBtn: TerminalButton
  private readonly _turnLeftBtn: TerminalButton
  private readonly _turnRightBtn: TerminalButton

  private readonly _errorSnd: AudioSource

  // @ts-ignore
  private _robot: Robot
  private _key: Key
  private _terminalCard: TerminalCard

  constructor(transform: TransformConstructorArgs) {
    super(new GLTFShape(resources.MODEL_TERMINAL), transform);

    const screen = new BaseEntity(new GLTFShape(resources.MODEL_TERMINAL_SCREEN), new Transform({ position: new Vector3(0,0.95,0.2) }) )
    screen.setParent(this)

    this._errorSnd = new AudioSource(new AudioClip(resources.SOUND_ERROR_TERMINAL))
	  this.addSound(this._errorSnd)

    this._turnRightBtn = new TerminalButton({ position: new Vector3(-0.4, 1.5, 0.2) })
    this._moveFwdBtn = new TerminalButton({ position: new Vector3(-0.15, 1.5, 0.2) })
    this._moveBackBtn = new TerminalButton({ position: new Vector3(0.15, 1.5, 0.2) })
    this._turnLeftBtn = new TerminalButton({ position: new Vector3(0.4, 1.5, 0.2)})

    this._turnLeftBtn.setParent(this)
    this._moveFwdBtn.setParent(this)
    this._moveBackBtn.setParent(this)
    this._turnRightBtn.setParent(this)

    this._turnLeftBtn.getComponent(Transform).rotate(new Vector3(0, 0, 1), 90)
    this._moveFwdBtn.getComponent(Transform).rotate(new Vector3(0, 0, 1), 180)
    this._turnRightBtn.getComponent(Transform).rotate(new Vector3(0, 0, 1), -90)

    this._key = new Key(new Transform({ position: new Vector3(global.POSITION.x + 1, 6, global.POSITION.z + 12) }));
    this._terminalCard = new TerminalCard(transform)
    this._terminalCard.setVisible(false)

    this.addComponent(
      new OnClick(() => {
        this._checkState();
      },
      {
        button: ActionButton.PRIMARY,
        distance: 6
      })
    )
  }

  public init(robot: Robot):void {
    this._robot = robot
  }

  public setKeyVisible(value: boolean) {
    if (value) {
      this._key.getComponent(Transform).scale.setAll(1)
    } else {
      this._key.getComponent(Transform).scale.setAll(0)
    }
  }

  public setKeyIconVisible(value: boolean) {
    if (value) {
      this._key.showIcon()
    } else {
      this._key.hideIcon()
    }
  }

  private _checkState(): void {
    if ((Global.HAS_KEY && !global.TERMINAL_IS_ACTIVE)) {
      this._activeButtons();
      this._key.hideIcon()

      const insertSnd = new AudioSource(new AudioClip(resources.SOUND_INSERT_CARD))
      const insert = new Entity();
      engine.addEntity(insert);
      insert.setParent(this)
      insert.addComponent(insertSnd)
      insertSnd.playOnce();

      this._terminalCard.setVisible(true)

      this.removeComponent(OnClick)
      this.addComponent(new OnClick(
        () => ui.displayAnnouncement('Use screen buttons for action'),
        { hoverText: "Use buttons" }
        )
      )

      global.TERMINAL_IS_ACTIVE = true
    } else {
      if (global.IS_QUEST) {
        ui.displayAnnouncement('Find the key');
      }
      this._errorSnd.playOnce();
    }
  }

  private _activeButtons(): void {
    const robot = this._robot
    this._moveFwdBtn.addComponent(
      new OnPointerDown((): void => {
        robot.move(Move.FORWARD);
      },
        { hoverText: "Move forward" })
    )
    this._moveFwdBtn.addComponent(
      new OnPointerUp((): void => {
        robot.move();
      })
    )

    this._moveBackBtn.addComponent(
      new OnPointerDown((): void => {
        robot.move(Move.BACK);
      },
        { hoverText: "Move back" })
    )
    this._moveBackBtn.addComponent(
      new OnPointerUp((): void => {
        robot.move();
      })
    )

    this._turnRightBtn.addComponent(
      new OnPointerDown((): void => {
        robot.rotate(Rotate.RIGHT);
      },
        { hoverText: "Turn right" })
    )
    this._turnRightBtn.addComponent(
      new OnPointerUp((): void => {
        robot.rotate();
      })
    )

    this._turnLeftBtn.addComponent(
      new OnPointerDown((): void => {
        robot.rotate(Rotate.LEFT);
      },
        { hoverText: "Turn left" })
    )
    this._turnLeftBtn.addComponent(
      new OnPointerUp((): void => {
        robot.rotate();
      })
    )
  }
}