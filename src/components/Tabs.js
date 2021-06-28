import {Component} from "react";
import PropTypes from "prop-types";
import Tab from "./Tab";
import {tabBar} from "./Tabs.module.css"
import {inactiveTabContent} from "./Tabs.module.css"
import {activeTabContent} from "./Tabs.module.css"

class Tabs extends Component
{
    static propTypes = {
        children: PropTypes.instanceOf(Array).isRequired,
    }

    constructor(props)
    {
        super(props);

        this.state = {
            currentTab: this.props.children[0].props.label,
        };
    }

    onClickTabItem = (tab) => {
        this.setState({currentTab: tab});
    }

    render() {
        const {
            onClickTabItem,
            props: {
                children,
            },
            state: {
                currentTab,
            }
        } = this;

        return (
            <div className="tabs">
                <ol className={tabBar}>
                    {children.map((child) => {
                        const { label } = child.props;

                        return (
                            <Tab
                                currentTab={currentTab}
                                key={label}
                                label={label}
                                onClick={onClickTabItem}
                            />
                        );
                    })}
                </ol>
                <div className="tab-content">
                    {children.map((child) => {
                        if (child.props.label !== currentTab) {
                            return (
                                <div className={inactiveTabContent} key={child.props.label}>{child.props.children}</div>
                            );
                        }
                        return <div className={activeTabContent} key={child.props.label}>{child.props.children}</div>;
                    })}
                </div>
            </div>
        );
    }
}

export default Tabs;
