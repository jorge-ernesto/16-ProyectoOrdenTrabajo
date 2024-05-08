if (method == 'getUser') {

    // Obtener datos
    let { user } = objHelper.getUser();

    // Respuesta
    response = {
        code: '200',
        status: 'success',
        method: method,
        user: user
    };
}
