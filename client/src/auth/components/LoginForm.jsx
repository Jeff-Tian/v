import React, {PropTypes} from 'react';
import '../../semantic-ui/semantic.min.css';
import classnames from 'classnames';

const LoginForm = ({
                       onSubmit,
                       errors,
                       successMessage,
                       user,
                       onChange
                   }) => (
    <form className={classnames({
        'ui': true,
        'form': true,
        'error': !!errors.summary,
        'success': !!successMessage
    })} action="/" onSubmit={onSubmit}>
        <h2 className="ui header">登录</h2>

        {successMessage && <div className="ui success message">{successMessage}</div>}
        {errors.summary && <div className="ui error message">{errors.summary}</div>}

        <div className="field">
            <input type="text" id="username" name="name" onChange={onChange} value={user.name}/>
        </div>
        <div className="field">
            <input type="text" id="password" name="password" onChange={onChange} value={user.password}/>
        </div>
        <div className="field">
            <button type="submit" id="submit" className="ui primary button">登录</button>
        </div>
    </form>
)

LoginForm.prototypes = {
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    errors: PropTypes.object.isRequired,
    successMessage: PropTypes.string.isRequired,
    user: PropTypes.object.isRequired
};

export default LoginForm;