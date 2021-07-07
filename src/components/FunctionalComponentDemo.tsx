import {useBindings} from "./BindingsProvider";
import {ClearText} from "../command/ClearText";
import React, {Component, useEffect} from "react";

const FunctionalComponentDemo = ({component}: {component: Component}) => {
    const bindings = useBindings().bindings;
    const clearTextButton: React.RefObject<HTMLButtonElement> = React.createRef();

    // Equivalent to componentDidMount() from the class-based version
    useEffect(() => {
        bindings.buttonBinder()
            .on(clearTextButton.current!)
            .toProduce(() => new ClearText(component, 'txt' as keyof Readonly<{}>, 'textFieldValue' as keyof Readonly<{}>))
            .bind();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
            <p>
                This functional React Component uses Context to get the Bindings object from a parent component.
                Number of actions in history: {bindings.undoHistory.getUndo().length + bindings.undoHistory.getRedo().length}
                <br/><button ref={clearTextButton}>Another Clear text button</button>
            </p>
    );
}

export default FunctionalComponentDemo
