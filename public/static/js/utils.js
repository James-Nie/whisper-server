

const request = (url, options={}) =>{
    const accessToken = localStorage.getItem('accessToken');
    
    return fetch(url, {
        ...options,
        headers: {
            accessToken,
            'content-type': 'application/json',
            ...(options.headers || {})
        }
    }).then(res => {
        return res.json()
    })
}

const login = function (formData) {
    return new Promise((resolve, reject) => {
        fetch(`/api/login`, {
            method: 'post',
            body: JSON.stringify(formData),
            headers: {
                'content-type': 'application/json'
            }
        }).then(res=>{
            return res.json()
        }).then(res=>{
            if(res.success) {
                resolve(res.data);
            }
        })
    })
    
}

export {
    request,
    login
}