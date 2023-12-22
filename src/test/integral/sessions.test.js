import supertest from 'supertest';
import chai from 'chai'
import app from "../../server.js";

import { cartService } from '../../services/index.js';
import { userService } from '../../services/index.js';

const expect = chai.expect;
const requester = supertest(app)

const newUser = {
    first_name: 'prueba20',
    last_name: "test",
    age: 25,
    email: 'prueba@mail.com',
    password: 'abc123'
}

let cookie

describe('Testing Router Sessions', () => {
    describe('Test de sessions', () => {


        // after(async() => {
        //     try {

        //         const cartIdOfUser = 

        //     } catch (error) {
        //         console.error(error);
        //         expect.fail('Request failed');
        //     }
        // });



        it('El endpoint POST /api/sessions/register debe crear un usuario correctamente', async function () {
            const response = await requester.post('/api/sessions/register').send(newUser)
            expect(response.status).to.equal(200);
        }).timeout(5000)

        it('El endpoint POST /api/sessions/login debe loguear al usuario y devolver una cookie', async function () {
            const response = await requester.post('/api/sessions/login').send(newUser)
            const cookieResult = response.headers['set-cookie'][0]
            expect(cookieResult).to.be.ok;
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            expect(cookie.name).to.be.ok.and.eql('coderCookie');
            expect(cookie.value).to.be.ok
        }).timeout(5000)
        
        it('El endpoint GET /api/sessions/current debe traer al usuario que contiene la cookie', async function () {
            const response = await requester.get('/api/sessions/current').set('Cookie', [`${cookie.name}=${cookie.value}`])
            expect(response.body.payload.email).to.be.eql(newUser.email);
        }).timeout(5000)
    })

})






// import supertest from "supertest";
// import chai from "chai";
// import app from "../../server.js";

// const expect = chai.expect;
// const request = supertest(app);

// describe('API de autenticación', () => {
//     let userId;
//     let cookie;
  
//     const userMock = {
//         first_name: 'prueba4',
//         last_name: 'test4', 
//         email: 'prueba14@coder.com', 
//         age: '27',
//         password: '1234'
//     }

//     const reqBody = {
//         email: 'prueba14@coder.com',
//         password: '1234'
//     }

//     before(async() => {
//         // try {
//         //     const login = await request.post('/api/sessions/login').send(reqBody);
//         //     const cookieResult = login.headers['set-cookie'][0];
//         //     expect(cookieResult).to.be.ok;
//         //     cookie = {
//         //         name: cookieResult.split('=')[0],
//         //         value: cookieResult.split('=')[1]
//         //     }
//         //     expect(cookie.name).to.be.ok.and.eql('coderCookie');
//         //     expect(cookie.value).to.be.ok;
//         // } catch (error) {
//         //     console.error(error);
//         //     expect.fail('Request failed');
//         // }
//     });
  
//     // Test para la ruta POST '/register'
//     it('debería registrar un nuevo usuario', async () => {
//         const res = await request.post('/api/sessions/register').send(userMock);
//         expect(res.statusCode).to.equal(200);
//         console.log('============================>',res.body)
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.property('status', 'success');
//         userId = res.body.payload._id;
//     });
  
//     // Test para la ruta GET '/failregister'
//     it('debería fallar al registrar', async () => {
//         const res = await request.get('/api/sessions/failregister');
//         expect(res.statusCode).to.equal(400);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.property('error', 'Failed');
//     });
  
//     // Test para la ruta POST '/login'
//     it('debería iniciar sesión con el usuario registrado', async () => {
//         const res = await request.post('/api/sessions/login').send(userMock);
//         expect(res.statusCode).to.equal(200);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.property('status', 'success');
//     });
  
//     // Test para la ruta GET '/faillogin'
//     it('debería fallar al iniciar sesión', async () => {
//         const res = await request.get('/api/sessions/faillogin');
//         expect(res.statusCode).to.equal(400);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.property('status', 'error');
//     });

//     // Test para la ruta POST '/login'
//     it('debería iniciar sesión con JWT y devolver un token', async () => {
//         const res = await request.post('/api/sessions/login').send(userMock);
//         expect(res.statusCode).to.equal(200);
//         expect(res.body).to.be.an('object');
//         expect(res.body).to.have.property('status', 'success');
//         expect(res.headers).to.have.property('set-cookie');
//         const cookieResult = res.headers['set-cookie'][0];
//         expect(cookieResult).to.be.ok;
//         cookie = {
//             name: cookieResult.split('=')[0],
//             value: cookieResult.split('=')[1]
//         }
//         expect(cookie.name).to.be.ok.and.eql('coderCookie');
//         expect(cookie.value).to.be.ok;
//     });
// });


