import {Component} from "react";
import PropTypes from "prop-types";
import {activeTab} from "./Tab.module.css";
import {inactiveTab} from "./Tab.module.css";

class Tab extends Component {
    static propTypes = {
        currentTab: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    onClick = () => {
        const { label, onClick } = this.props;
        onClick(label);
    }

    render() {
        const {
            onClick,
            props: {
                currentTab,
                label,
            },
        } = this;

        return (
            <li>
                { currentTab === label ?
                    <button className={activeTab} onClick={onClick}>
                        {label}
                    </button>
                    :
                    <button className={inactiveTab} onClick={onClick}>
                        {label}
                    </button>
                }
            </li>
        );
    }
}

export default Tab;
