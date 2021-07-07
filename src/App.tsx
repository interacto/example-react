import './App.css';
import Tabs from "./components/Tabs";
import FunctionalComponentDemo from "./components/FunctionalComponentDemo";
import {Bindings, Redo, Undo} from 'interacto';
import React, {ChangeEvent, Component} from 'react';
import {ClearText} from "./command/ClearText";
import {SetText} from "./command/SetText";
import {HistoryGoBack} from "./command/HistoryGoBack";
import {HistoryGoForward} from "./command/HistoryGoForward";
import {HistoryBackToStart} from "./command/HistoryBackToStart";
import {DrawRect} from "./command/DrawRect";
import {ChangeColor} from "./command/ChangeColor";
import {DeleteElt} from "./command/DeleteElt";
import {Card} from "@material-ui/core";
import {TransferArrayItemReact} from "./command/TransferArrayItemReact";
import {DisplayPreview} from "./command/DisplayPreview";
import {HidePreview} from "./command/HidePreview";
import {MovePreview} from "./command/MovePreview";
import {BindingsContext} from "./components/BindingsProvider";

type MyCard = {
    title: string,
    subTitle: string,
    text: string
}

export type AppState = {
    txt: string, // Text stored by the undo/redo system
    textFieldValue: string, // Current text content of the text field
    cards1: Array<MyCard>,
    cards2: Array<MyCard>,
};

class App extends Component<{ bindings: Bindings }, AppState> {
    private clearTextButton: React.RefObject<HTMLButtonElement> = React.createRef();
    private textArea: React.RefObject<HTMLTextAreaElement> = React.createRef();
    private undoButton: React.RefObject<HTMLButtonElement> = React.createRef();
    private redoButton: React.RefObject<HTMLButtonElement> = React.createRef();
    private undoButtonContainer: React.RefObject<HTMLDivElement> = React.createRef();
    private redoButtonContainer: React.RefObject<HTMLDivElement> = React.createRef();
    private baseStateButton: React.RefObject<HTMLButtonElement> = React.createRef();
    private canvas: React.RefObject<SVGSVGElement> = React.createRef();
    private cards1: React.RefObject<HTMLDivElement> = React.createRef();
    private cards2: React.RefObject<HTMLDivElement> = React.createRef();
    private preview: React.RefObject<HTMLDivElement> = React.createRef();
    private undoButtons: Array<HTMLButtonElement> = [];

    // For the card drag-and-drop
    public mementoX: string = "";
    public mementoY: string = "";
    public mementoCSSPosition: string = "";
    public card: HTMLElement | undefined = undefined;
    public sourceIndex: number = 0;

    static contextType = BindingsContext;
    private bindings: Bindings;

    constructor(props: { bindings: Bindings }) {
        super(props);
        this.bindings = props.bindings;
        this.state = {
            txt: "foo",
            textFieldValue: "foo",
            cards1: [{
                title: 'card 1',
                subTitle: 'The card 1',
                text: 'Some text for card 1'
            },
            {
                title: 'card 2',
                subTitle: 'The card 2',
                text: 'Some text for card 2'
            }],
            cards2: [{
                title: 'card 3',
                subTitle: 'The card 3',
                text: 'Some text for card 3'
            }],
        };

        this.onTextChange = this.onTextChange.bind(this);
    }

    componentDidMount() {
        // How to access bindings by using Context instead of props:
        // (not available in the constructor)
        // this.bindings = this.context.bindings as Bindings;
        this.setupBindings();

        const drawrect = new DrawRect(this.canvas.current!);
        drawrect.setCoords(10, 10, 300, 300);
        drawrect.execute();

        this.preview.current!.style.display = 'none';
    }

    setupBindings() {
        // This binder creates the command that allows the user to move a card from one list to another
        this.bindings.dndBinder(true)
            .on(window.document.body)
            .toProduce(() => {
                // The command is not executable until a proper target destination for the card has been selected by the user
                // The -1 index prevents makes canExecute() return false and prevents Interacto from executing the command
                return new TransferArrayItemReact(this, '', '', -1, 0, 'Drag card');
            })
            // Checks if the user picked a valid card, and a new list for the card as a destination
            .when(i => {
                // A valid card has to be selected in order to create the command
                const card = (i.src.target as Element).closest('.cards');
                return card !== null;
            })
            .first((c, i) => {
                this.card = (i.src.target as Element).closest('.cards') as HTMLElement;
                this.sourceIndex = Array.prototype.indexOf.call(this.card.parentNode!.children, this.card);
                // Saves the initial state of the card's style to be able to restore it if the command can't be executed
                this.mementoX = this.card.style.left;
                this.mementoY = this.card.style.top;
                this.mementoCSSPosition = this.card.style.position;
                // Edits the card's style to make it movable visually
                this.card.style.width = String(this.card.clientWidth) + 'px';
                this.card.style.position = 'absolute';
                this.card.style.zIndex = '999';
            })
            .then((c, i) => {
                // Retrieves the position of the mouse on the page
                let x = i.tgt.pageX - 220;
                let y = i.tgt.pageY;
                // Prevents parts of the card from going outside of the document
                if(this.card!) {
                    if (i.tgt.pageX > window.innerWidth - this.card.clientWidth - 10) {
                        x = x - this.card.clientWidth - 5;
                    }
                    if (i.tgt.pageY > window.innerHeight - this.card.clientHeight - 15) {
                        y = y - this.card.clientHeight - 5;
                    }
                    // Moves the card visually
                    this.card.style.left = String(x) + 'px';
                    this.card.style.top = String(y) + 'px';

                    // Checks if the target selected is valid for the current card and makes the command executable if it is
                    const isCardPositionValid = (this.card.parentNode === this.cards1.current ?
                        i.tgt.target === this.cards2.current : i.tgt.target === this.cards1.current);
                    if (!isCardPositionValid) {
                        c.srcIndex = -1;
                    } else {
                        c.srcIndex = this.sourceIndex;

                        // Defines which array is the source and which one is the target
                        const fromSrcToTgt = i.tgt.target === this.cards2.current && i.src.target !== this.cards1.current;
                        if (fromSrcToTgt) {
                            c.srcArray = 'cards1';
                            c.tgtArray = 'cards2';
                        } else {
                            c.srcArray = 'cards2';
                            c.tgtArray = 'cards1';
                        }
                    }
                }
            })
            // Resets the position of the card if the command is invalid or cancelled
            .ifCannotExecute(() => {
                if(this.card!) {
                    this.card.style.left = this.mementoX;
                    this.card.style.top = this.mementoY;
                    this.card.style.position = this.mementoCSSPosition;
                }
            })
            .cancel(() => {
                if(this.card!) {
                    this.card.style.left = this.mementoX;
                    this.card.style.top = this.mementoY;
                    this.card.style.position = this.mementoCSSPosition;
                }
            })
            .bind();

        this.context.bindings.buttonBinder()
            .on(this.clearTextButton.current!)
            .toProduce(() => new ClearText(this, 'txt' as keyof Readonly<{}>, 'textFieldValue' as keyof Readonly<{}>))
            .bind();

        (this.context.bindings as Bindings).textInputBinder()
            .on(this.textArea.current!)
            .toProduce(() => new SetText(this, 'txt' as keyof Readonly<{}>, 'textFieldValue' as keyof Readonly<{}>))
            .then((c, i) => c.text = (i.widget as HTMLInputElement).value)
            .end(() => this.forceUpdate())
            .bind();

        this.bindings.buttonBinder()
            .on(this.undoButton.current!)
            .toProduce(() => new Undo(this.context.bindings.undoHistory))
            .bind();

        this.bindings.buttonBinder()
            .on(this.redoButton.current!)
            .toProduce(() => new Redo(this.bindings.undoHistory))
            .bind();

        this.bindings.buttonBinder()
            .on(this.baseStateButton.current!)
            .toProduce(() => new HistoryBackToStart(this.bindings.undoHistory))
            .bind();

        this.bindings.buttonBinder()
            .onDynamic(this.undoButtonContainer.current!)
            .toProduce(i => new HistoryGoBack(Array.from(this.undoButtonContainer.current!.childNodes).indexOf(i.widget!), this.bindings.undoHistory))
            .bind();

        this.bindings.buttonBinder()
            .onDynamic(this.redoButtonContainer.current!)
            .toProduce(i => new HistoryGoForward(Array.from(this.redoButtonContainer.current!.childNodes).indexOf(i.widget!), this.bindings.undoHistory))
            .bind();

        this.bindings.tapBinder(3)
            .toProduce(i => new ChangeColor(i.taps[0].currentTarget  as SVGElement))
            .onDynamic(this.canvas.current!)
            .when(i => i.taps[0].currentTarget !== this.canvas.current
                && i.taps[0].currentTarget instanceof SVGElement)
            // Does not continue to run if the first targeted node is not an SVG element
            .strictStart()
            .bind();

        this.bindings.longTouchBinder(2000)
            .toProduce(i => new DeleteElt(this.canvas.current!, i.currentTarget  as SVGElement))
            .onDynamic(this.canvas.current!)
            .when(i => i.currentTarget !== this.canvas.current && i.currentTarget instanceof SVGElement)
            // Prevents the context menu to pop-up
            .preventDefault()
            // Consumes the events before the multi-touch interaction and co use them
            .stopImmediatePropagation()
            .bind();

        // Command previews

        // Displays command previews for undo buttons

        this.bindings.mouseoverBinder(false)
            .onDynamic(this.undoButtonContainer.current!)
            .toProduce(i => new DisplayPreview(
                this.bindings.undoHistory.getUndo()[Array.from(this.undoButtonContainer.current!.childNodes).indexOf(i.target! as HTMLButtonElement)],
                this.preview.current!))
            .bind();

        // Displays command previews for redo buttons
        this.bindings.mouseoverBinder(false)
            .onDynamic(this.redoButtonContainer.current!)
            .toProduce(i => new DisplayPreview(
                this.bindings.undoHistory.getRedo()[
                this.bindings.undoHistory.getRedo().length
                - Array.from(this.redoButtonContainer.current!.childNodes).indexOf(i.target! as HTMLButtonElement)
                - 1],
                this.preview.current!))
            .bind();

        // Hides command previews for undo and redo buttons
        this.bindings.mouseoutBinder(false)
            .onDynamic(this.undoButtonContainer.current!)
            .onDynamic(this.redoButtonContainer.current!)
            .toProduce(() => new HidePreview(this.preview.current!))
            .bind();

        // Moves command previews to the mouse's position for undo and redo buttons
        this.bindings.mousemoveBinder()
            .onDynamic(this.undoButtonContainer.current!)
            .onDynamic(this.redoButtonContainer.current!)
            .toProduce(i => new MovePreview(this.preview.current!, i.pageX, i.pageY))
            .bind();
    }

    onTextChange(evt: ChangeEvent): void {
        this.setState({textFieldValue: (evt.target as HTMLTextAreaElement).value});
    }

    render() {
        return (
            <div>
                <div className="preview" ref={this.preview}>
                    <p></p>
                    <svg className="preview-canvas">
                    </svg>
                </div>

                <div className="history">
                    <div className="header">
                        <h2>HISTORY</h2>
                        <button className="button-undo-redo" ref={this.undoButton}>UNDO</button>
                        <button className="button-undo-redo" ref={this.redoButton}>REDO</button>
                    </div>

                    <div className="buttons">
                        <button className="history-button-active" ref={this.baseStateButton}>Start</button>

                        <div ref={this.undoButtonContainer}>
                            {this.bindings.undoHistory.getUndo().map((elt, index) =>
                                <button className="history-button-active" key={index} ref={(ref) => this.undoButtons[index] = ref as HTMLButtonElement}>{elt.getUndoName()}</button>
                            )}
                        </div>

                        <div ref={this.redoButtonContainer}>
                            {this.bindings.undoHistory.getRedo().slice().reverse().map((elt, index) =>
                                <button className="history-button-inactive" key={index}>{elt.getUndoName()}</button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="main">
                    <h1>An Interacto-React app</h1>
                    <Tabs>
                        <div title="Type some text">
                            <textarea value={this.state.textFieldValue} onChange={this.onTextChange} ref={this.textArea}/>
                            <br/>
                            <button className="clearTextButton" ref={this.clearTextButton}>Clear text</button>
                            <br/><br/>
                            <FunctionalComponentDemo component={this} />
                        </div>

                        <div title="Create and edit rectangles">
                            <p>
                                Multi-touch (two touches) creates a rectangle.<br/>
                                Three taps changes the color of the targeted rectangle.<br/>
                                A long touch (2 seconds) removes the targeted rectangle.<br/>
                                Swipe horizontally to clear all the SVG shapes.<br/>
                            </p>
                            <br/>

                            <svg width="1000" height="600" style={{border: "1px solid black"}} ref={this.canvas}>
                            </svg>
                        </div>

                        <div title="Drag the cards">
                                <div className="cards-block" ref={this.cards1}>
                                    {this.state.cards1.map(card =>
                                        <Card className="cards" key={card.title}>
                                            <div>
                                                <p>{card.title}</p>
                                                <p>{card.subTitle}</p>
                                            </div>
                                            <div>
                                                <p>
                                                    {card.text}
                                                </p>
                                            </div>
                                        </Card>
                                    )}
                                </div>

                                <div className="cards-block" ref={this.cards2}>
                                    {this.state.cards2.map(card =>
                                        <Card className="cards" key={card.title}>
                                            <div>
                                                <p>{card.title}</p>
                                                <p>{card.subTitle}</p>
                                            </div>
                                            <div>
                                                <p>
                                                    {card.text}
                                                </p>
                                            </div>
                                        </Card>
                                    )}
                                </div>
                        </div>
                    </Tabs>
                </div>
            </div>
        );
    }
}

export default App;
