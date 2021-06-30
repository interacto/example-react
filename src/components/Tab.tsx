import {Component} from "react";
import PropTypes from "prop-types";
import styles from "./Tab.module.css";

type MyProps = {
    label: string;
    currentTab: string;
    onClick: (label: string) => void;
};

class Tab extends Component<MyProps> {
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
                    <button className={styles.activeTab} onClick={onClick}>
                        {label}
                    </button>
                    :
                    <button className={styles.inactiveTab} onClick={onClick}>
                        {label}
                    </button>
                }
            </li>
        );
    }
}

export default Tab;
