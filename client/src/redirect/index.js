import React from 'react'
import {Segment} from "semantic-ui-react";
import {browserHistory, Link} from "react-router";

const Redirect = ({redirect}) => {
    const [count, setCount] = React.useState(10)

    React.useEffect(() => {
        const timer = setInterval(() => {
            setCount(count => count - 1)

            if (count <= 0) {
                browserHistory.push(redirect)
            }

        }, 1000)

        return () => clearInterval(timer)
    })

    return <Segment><Link to={redirect}>{count} 秒后自动跳转至 {redirect} 页面</Link></Segment>
}

export default Redirect