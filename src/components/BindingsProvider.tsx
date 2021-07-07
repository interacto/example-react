import React, {Component, useContext} from "react";
import {Bindings, BindingsImpl} from "interacto";
import {UndoHistoryReact} from "../command/UndoHistoryReact";

export const BindingsContext = React.createContext({bindings: new BindingsImpl() as Bindings});

/**
 * Equivalent to useContext(BindingsContext).
 * For functional components only.
 */
export const useBindings = () => {
    return useContext(BindingsContext);
}

/**
 * Creates a Bindings object and provides it to child components through the Context API.
 */
class BindingsProvider extends Component<any, { bindings: Bindings }> {
    constructor(props: any) {
        super(props);

        this.state = {
            bindings: new BindingsImpl(new UndoHistoryReact(this))
        }
    }

    render() {
        return (
            <BindingsContext.Provider value={this.state}>
                {this.props.children}
            </BindingsContext.Provider>
        );
    }
}

export default BindingsProvider;
