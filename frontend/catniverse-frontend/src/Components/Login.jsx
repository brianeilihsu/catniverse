import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
    const [state, setState] = useState(false);

    return(
        <div>
            <header>登入會員</header>
            <form>
                <div>
                    <input type="text" id="account" required placeholder="Username"/>
                </div>
                <div>
                    <input type="password" id="password" class="pass-key" required placeholder="Password"/>
                </div>
                <br/>
                <div>
                    <button type="submit" value="LOGIN" >登入</button>
                </div>
                <div>
                    <span> <Link to='register'>立即註冊</Link> </span>
                </div>
            </form>
        </div>
    );
}
export default Login