export default class LastMayday {
  palette() {
    return ({
      width: '654rpx',
      height: '1000rpx',
      background: '#eee',
      views: [
        _textDecoration('overline', 0),
        _textDecoration('underline', 1),
        _textDecoration('line-through', 2),
        _textDecoration('overline underline line-through', 3, 'red'),
        {
          type: 'rect',
          css: {
            width: '200rpx',
            right: '20rpx',
            top: '30rpx',
            height: '100rpx',
            borderRadius: '100%',
            shadow: '10rpx 10rpx 5rpx #888888',
            color: 'linear-gradient(-135deg, #fedcba 0%, rgba(18, 52, 86, 1) 20%, #987 80%)',
          },
        },
        {
          id: 'my-text-id',
          type: 'text',
          text: "fontWeight: 'bold'",
          css: [{
            top: `${startTop + 4 * gapSize}rpx`,
            shadow: '10rpx 10rpx 5rpx #888888',
            fontWeight: 'bold',
          }, common],
        },
        {
          type: 'rect',
          css: {
            width: '20rpx',
            height: '20rpx',
            color: 'red',
            left: [`${startTop}rpx`, 'my-text-id'],
            top: `${startTop + 4 * gapSize + 15}rpx`,
          },
        },
        {
          id: 'text-id-2',
          type: 'text',
          text: '我是把width设置为400rpx后，我就换行了xx行了',
          css: [{
            top: `${startTop + 5 * gapSize}rpx`,
            align: 'center',
            width: '400rpx',
            background: '#538e60',
            textAlign: 'center',
            padding: '10rpx',
            scalable: true,
            deletable: true,
          }, common, { left: '300rpx' }],
        },
        {
          type: 'rect',
          css: {
            width: '20rpx',
            height: '20rpx',
            color: 'red',
            left: '200rpx',
            top: [`${startTop + 5 * gapSize}rpx`, 'text-id-2'],
          },
        },
        {
          type: 'text',
          text: '我设置了maxLines为1，看看会产生什么效果',
          css: [{
            top: `${startTop + 7 * gapSize}rpx`,
            width: '500rpx',
            maxLines: 1,
          }, common],
        },
        _image(0),
        _des(0, '普通'),
        _image(1, 30),
        _des(1, 'rotate: 30'),
        _image(2, 30, '20rpx'),
        _des(2, 'borderRadius: 30rpx'),
        _image(3, 0, '60rpx'),
        _des(3, '圆形'),
        {
          type: 'image',
          url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCADIAMgDASIAAhEBAxEB/8QAHAAAAQQDAQAAAAAAAAAAAAAAAAMEBQYBAgcI/8QAQxAAAgEDAgQDBQUGAggHAAAAAQIDAAQRBSEGEjFBIlFhBxNxgZEUMkJSoSNicrHB0RXhCCQzNENTgqIWkrLC0uLw/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AODBcVq52+dK46VpKPD86BE1nrituUmMN2rXPT0NADc4p1Zm3jnzcRtJGwK8qtg/GmpBB3GKVhCNKvvCypnxFRkj5UClzFFFLiGTnQ7q2N/gfWk03weYAgdD5Vbp+Enm4bt9TtJEuUlwowCjBublAKnrmrU/szt5tNitbeNxqCp4ZY9+Zu+R5UHKSSckb5670tatyTKoyATynI2wa6Pp3smvru8e21JDpd0y/sInw3vJPy56AHtQnCyR2c+lGyW3nwUnjY4fPZwx679qCH0Hh/h6HUWg4kvNSs7iF+R0gjjk8QPcZyB8jXoTh3WeGrnSYNNTWbO6RBhQ5aB8eqseteZdR0++1jV4LUW8supxqILhUXJcrsrfNcfSrnwPwLxMvFNrbalYX3+EuWEknPyrjlOGGfX0oO26pwdbMINT0nm+2WbieBC/Mr4zlc+oJH0pFrWHVELQ5K3Sm5gB2y2MPGfXAz6YNNIuCZbJxJp2p3ULrsucqR81/tTzTrLVrWSWC9lgmVpfexXCHDRzeTLjHi/v50ERo7jQ9Thgk2t5F91zt2XPhz6g7H0OauvL2+tQXEFlHqVl72Me6aZW5gOscq9RTjQL57zTI1nI+0xIofB+8Ozf/u4oKzrtvycUsmQBN4t/+lv/AGmnGmhn4ltVxiNUI9ck7fyp7xTCqXdje4+64Un0zj+TVixV1voriNObN0Yh6YQ/1oLTpUMUVtqFy/3Jp3kJz2UYz+hqMtgmkadItogjvL9jcS8xJEYbvv3x286sawpbaYInwUSPx+vc1WEFyUN5dICl0+Vb8n5U+AGwoGWtQyz8C3yuRK1rPzRjoQpxscfxVvwg/Nw+hI8XvZAf/NTq9T3fCGsyNurjZfUACoXh2+j03gt72ZuVFeR9+++APrQJcR3gu9ahtEyVtxzsQNs9Bv8AE/pUrqF+llavbLu9vZtIw9SMKPmaq+iCW91SP3+fezS+9kB/CB+H5U01rVhez3ckMgU3M/JGR1EabBj6d/iRQQus6gV08WUTZazAiLLkZmY88hB8gML9aKiLu4jF5NDGrlIXxsfxcoH1wP1ooOV7ncYrVhmOgE9M5rbcrQaouYwKRxgkUuuQorLDxK2NxQEkfMobzFaKhJAAYs33eXvThByoAcY3wcdqvvBunWcKRXkcasxXmaVxzFfMDyoJH2VcDapq3EcUuotPbWNrH9oKMSST0Tw9AepHwr0fYaTZ6auLaEKx+9Id2b4mozhDRjpGjAzJi7um99P5j8q/If1qwUDe7sbe+hMVxGHHn0I9QexqK1LhmDUoMSuDcquEuSvjP8XnU/jIo5aDmUegLaXiNd2SW9yXDJcI3Kecbf7Qb8rDbB6bGrJo3DsEGrSa3Df3NxJJH7lI7k5EG/iGBjxZ6k+VWOa3iuInimjWSN9mVhkGmcFmNPkzEsjxNgNvk+hPn8aB48ZkADOwHcIcZrV7eJ4TCUHu2G4FLYrGN6Cs6nE1ospdc5w7kD7wG3P8QNm+tVyymFjcRyR8zsryR+HcMoOSv03Hwros0CXEZRwfQjqp8xXM7xns78QpGVVLtucRpkHtkfl69PpQWLXY4r7QHlQ80QHvFb907H+f6U54Ysxcafp9yxP7EM7b/elPhOfhv9ahdG1GOW6ubB257SZWPMOkWfD/ANxz9KnuEpXtY5dNuMCVGLD18/6H50FinANvKD0KEfpUTqae60WC26EmMHby3P8AKpeZ0jiZ5CAgG+agNavHhthcXKqpY4tbU78zfmf0HXFBAa7qKiyj0xGzyn39x8fwr/X6VWtQu0k0jTLNN1iUTuP32yRt6A1nUhIySqh55pD4nPct95jUdI8UGWmyFG2QMn4AdzQLy3503Rbi5jz9rvc2tuo64/G/yHeo6C1+zTWEDnMt8gcEjqoblwPQZpeCQX+qxRXDLCqx5I5vDbwrueY/UnzNQWta/NqXEUeqWZ93FbYS1jYY/Zr5/wAX9qBDUrA22qXkWMus7dT5iipPiie11KaHU4Q7W9/Grsi7FJV2dW9RsfnRQcUAxg1uMedYB8q2AU9OtBjkzjBxWxXAx1z2rKjHqa3Ix8MbUGORQu9dK9k+s2Fhdp9vt5LkQuT7uPDMO6sF/EB5VzQNhST1Arq/sE1qGx4oudJuUj/1+LmgkZRlZE35QfVSfpQeh7HUbTUohJazB8jJUgq4+KncU8FNpbWG5YNKmXX7rjZl+DdaWhV1hRZH53A3bzoFqKRe4jjPKWy/5F3P0rX38gBcwlUGPvHf6UC9YxW3StC6g4OR6kbUGaKziskUGtUm9ty13NLCAJJLyQL68v8A9iKu52BIqMttPX7ek77iCPkUY252PMzUDXSOH4bS3cTxo0sg/aEdz/lSc9hPZX0ckS+8UEGKTv6q3y6H41YwMUnOAYmJOMbg+RoIq81izgZHu5DFGimTBU+NuwHn8KqOo6g+oXBvnG7DljT/AJadh8e5/wAquV9btPZiVkAlUeMDuD1rl1zMbF70MdreAZz+7zD+WKBK/uZIo2McXvAM+ItgCkILeBtIn1WecO0ZVYyBgKG329MfOndvp00nDl3qEjBPdWpMTHoWA3b4VF6RMjadqmmuRlVWeID8SBs/pk/SgqOoao8812sO1vI/KdsGRVxgH0zv60xSTOQcnH3VpMhpy+CcczN07EmntvbZTD7OOnfFBjnnaELHKyqW5iBuAcYz8aKdxp7rGNj0JAxRQcwyD51uowM9aRJ8XTalFOR6eVAqrLg+flWCCOtHKoGc71gPzOPpQb4I77090bUJtK1uxv4VZpre4SVEQ7thug+PSm0EMl1cJDGMEnc/lrqfs8ks+HdaguVtIZicK7yoGdAfxKexoO+W2rfb4IprO0ndZUDgyL7tVyM4JO/0FOkgnl/3m48P/Lh8I+vU021HV7TSoEmu5G/aNyRKAWaQ+QFR+n8Vwa5K1vpEcjurcssrrhYvP4mgn0MMBMcSeLuqLv8AOtGW4mmUMEjhG+55mY/ypaKNYo+ROn6k+db8wVSzHAHc0GohUnL5c+bf2rV5QWES7lts42Fbq3vEJKkKenrWieObw7JHsP4qBYYAxWaxWc0BWAMVmigKaSSGa8W3T7qeOU/yWkNV1WHTvs8BdftV1J7q3jPVm8/gOtOrS3+zw4J5nY8zsepNA461xji22+032rPaqP2SxySA7huTcLj1yB8q67d3Dw285iiMkiL4UzjmJ6VSeIdIGk8MESOHuZ2LzygfecsD9ANhQVPUdWW19mZVnBaax5VB6NzPy/yqhaZrjQahaXL8w90vI2Vwnkyt+6y4+BFSPFNz73SNNtoW8MMSFhj8RyR/U1VTCx5fEfDvjO1BKXtnDY6pLDBNz2/NzxP+ZG3X+3ypzar71ic+FTykiouNWDDBYbfL6U/i5+UZICjy70EmVCbbH40U1V5H35go8xvmig5MWyTWyZJxTyx0fUtQk5bPT7m4Of8AhxE1ctI9k/FOpMrPYpYofx3T8uP+kZNBTPur4u/nSTDl2BwTv8PWu0H2f8DcLQrNxVrv2mddzBG/IM/wrljTb/x7wHorAcN8NwmZdluJLcO/xHMf1oOV2MsWnXZe9in5tiFxgkfOpSXja+Tw2MMVuo6MRztU/r14/HWoQyXMLQsvW5dgzn93bYCpa29n8kWjpBaWyo+oHkS4lAdioO5UY/lQR/C2n8Ue0vW431fVL6SyiIViJCvN+4oGw9T2r0tomj2uh6bDZ2sSRpGoUBBgD0FRXCPDFtwxpUdtCiiXlwxHb0/vVlG1Bs7pFGzuwVVGSTSKK1yRJJtH1VPOmatHq08cg5mtYWJx2kbsfUCpPJNBrNKY4/Dgux5UHrW8UYijCA5x38/WmbMJWmnJ8EIKR4P4u5+u1PFLcozjON6DeiteamOqa3p2i2rXOo3ccEa9SxoJCqzxPxrp/DcZh51nv2Hgt1bp6sfwiuc8Ue2K5vOe00CJ7aE7G6cftD/CPw/Gqrw3pF3xfrsdlE8hMh97czsclF7sSe/l60HTeBba/wCI9bn4p1Yh/d5htRjZT+LlHYDp8c10qmun2NvplhDZWsYjghUIijyp1QN4SHubjb7rKP0qne0+6+y6Dbk82DKckfwmrdZye9e5ft70gfLaude2N2OiWBLuo+1cqJnHMeU+L5dqDjWoTPdXXOWbBx4QOgxtTRIyDgOTvTiSc82Gwqjbb+9aJI3M3Tc9RQOIVfl+8xxThI5XblXGF86SglVG+8TnqafIUZCRjz2oMwLIvglIcelFZU7ZAxRQQsXtW1GyjVNPtIUbOS8xLfoMUy1H2j8S6rGUn1J4kbqluOQfpVPij3yTSwC4xjfzoNrqVpcyM7MzHcsck1vpsbS3XKpBA35D+KkHb9oqZAx3NSWjRlbxGYRlfOguWi2k0wjiCH30rcvL38hXoy00+OH7HkDNpD7pPQ4GT+lcH0psyht+cEFT0INdg4Y1671W8uI7rkA5A6BR93z+NBbUNRl5cPqN02mWrYjX/eZR0H7g/r9KeTe+NtKLZlWcqQhfop86NOsotOs0gjy2B4nb7zHuTQOoIkt4VijGFUUlPcPz/ZrfecjJPaNfzH+gqG4m4mj0KCK3gQ3GqXXhtbZF5m9XYdlX1+FSGixzQ6av2jm99IxdzJ94k929aBw6qjWlmn3c8xHcqv8AmRWbzU7TT4mkuZ1QKMkd65rx97Qk0DiGawt0mmuI4FXCHlVS2WOW+m1cg1nijUtb5luZyIWOfcIcJ8/P50HWeKPbJBbiS20SMTS9PfMfAv8Af5VyPU9b1DWbo3N/cvM3byX4DtUVzkKAV8PYVlGI5gB8aB9ZxTXd3FbW6NLPK4SONOrMegr0zwPwlFwpoYhble+mw9zKO7flHoKqnsp4C/wi1TXtUhxfzL/q8TDeBD3P7zfoK6kOlBnc0dBk1kUheP7uznfyRv5UDfSc/Yg56uxauU/6QOpHT9J0PCBy1zI2CcdF/wA667aJ7qzhTyUVwf8A0k5DzcPRZ2xM3/poOTwa+kz+7MPuy5655hmpVZSWAOy+vUVRgcGrhCeYrvknuaCXiffY5yPKnELFG6sPh0xTK2BDjDgHpUjjlUZ6jagWVWdy3vCBjoRRWyToEKsUU/mzRQctAx0rOc0tyqrYrWQKmXyRQNCDJKe2T3qwaNbOHV5EwvVM/wA6h7MYmU9h971q2WPIY1BKkkZHioLNpbqHxnnfHXrXTOBIpZL2S5CkQxoUJ9T2FUHhvT/t2pW9omEMpC84XOB512zTrO20uxS3gXkhiXJPc+ZNBIrIodVLYZs4HnWmoXv2G0MojMsrHkijH42PQVXdJv3vuIHlfPLyMEHYCrE8UbzxTOCXjBCb7DPU486CN0jQ/s08mo37CfUp95JCPu+Sj0HYVLTXMVtDJcXEqxwxKXkdzhVUdSTTDWdcsNB0yTUNSnEMEffqWbsqjua81+0b2oapxZPJp0Aay0hWGIAfFL6yHv8ADpQQ+pa5Jrmv6tqbuWNzdvIN/wAP4R9MU2UlyfLyqK0sO8jxRqWZhkADJNWmy4b1W55eWzKA9DKwWgYruw5hy1172W+zg3UsXEOtQEWynns7aQf7Q9nYfl8h3pnwDwAk3EUD6ryXEcKe+aJR4NjsD+b4V3lRjtgUG3U1vWo61tQFNb/x26xd5XVP13p1TKeVTqVtCTuAX/tQPDXnb/SNuLabV9IhW5U3FvE4eAHdQ2CG/Suie0z2p2PBFq1lacl1rcq/s4c5WEfmk/ovevK+p6ld6xqM+oX07z3U7l5JHO5NA0QZkUdd6s9vMfDyJnBxg9jVVqd0uQPgs+M9aCzWzBx4xykdQakol95tjbyI3qHt2ZXPKVb086kYbhlYK+VPYE9fhQOY4A/hJKA9MCilw3Ko35Se5NFBzLPM536UjcsMKuPU0uEG5z2pjK5eQt8hQbwt+22zn0NWXSros5SRCFxsx7VVYzyyKfI1Z7G7hZsNkdN6Drns1iMurGZl5hDEWDHzO3966Zqbztprw26FpZiI1x2Hc1QPZkE/w26uU3DSCNT6Af510WJ/XNAlpGm/4dBlyrXD/fI6D0FIcScU6fwxpT3965bxckcKHxyP+UU/eZY1LscKo5ifIV5k4l16bWtYmlyRbiVmRebOST976YoM8U8V6lxVqhudQmPu0J9zAp8EK+Q8/jVGvDzXch/eqXuJFQMSTnFQbMXYsxyTvQWXgWIycRqwz4ImP9P612G0T7owM1xjg27W14jhWQkJMpiOPM9P1xXoPg/SbXVYLkTmRXiK8vIcdfOgmuFrq3sruRZSwLRjBxsN6vCMGUMCCD0IqgXFmdI1WGPm5o2BRWP4s7j9QatWhSM0Ei5yqkY9KCZBratM7UUGxNcT9qvtLXh3ULnTtKlSXVtgXG4thjv5t6dqX9qnthj0IS6Hw5Ksupnwz3SnmW39F83/AJV5vlmknmeWWRnkdizOxyWPmTQbXV3PfXUtzczPNPKxeSSRuZmPmTTeiigKktLk5bjlPSo2l7WQx3KEdzigu0Ch1Ei+YyQelSCshUqSG5utQ9pKMFTnOM7U/hY8pUgkt0oHrTPaxdVYL2YZx8DRTeRGAPMCVJ6daKCiyOUiJ+QFMKVmkLEDsKSoCpjTYiZEZmHIKh6lNNuAmzuQo7Cg9D8BwC14UswoC+8LSHHqatySYk65BqqaAyx6HZRrkAQJ89qmYrncL0NAx4+14aJwfdujgXFyPs0Pxbqfkua87A8h2NXH2jcR/wCOa/8AZoH5rSxzGmOjP+Nv6fKqhyg55hj17UEfeMREcnc7VG1JaoApUDzqNoNlYqQQSCO4rsHsm9o8Gn6odO12YRx3CiOO7Y7Bs7B//lXHaKD2nr1n9t0syI2JYSJEcb9DmnPDmTYvIejPtXDvZL7UGt3h4Z1+bmtpP2dpdSH/AGZPRG/d8vKu66NGbfS4Iz94Ak/Wgls+tefvab7apLj7TofC8jRQgmOfUF2Z/NY/IfvfSu73UvurK5f8sTn6Ka8LytzSu3mxNBqSWYknJPetaKKAooooCsgkHNYooLTYtzQryZz97r1zUvAzqRt6bb4qB0ifltkyPMVYLQgjIP0oHSq7EqDg0Up7o7Nt8+tFBzJ252LYrSiigKUjYq4KkA9iaTrI60HoPRdQaTR7NzgFoEPTp4RUfxdxU2k6Wbe1m/125UquP+Gvdv6CoVtZFppy3DnCxIvh6cxxsoqiXuoXOpX0l1cvmRz8gOwHpQCgqpPl0NB5uVSSa196SoxsBQxJQY2NBHX7lpBk5PemdL3Tc1w1IUBRRRQSOhaZLrOu2Omw557mdYxjtk7n6V7OtAttbRW6FikSLGpY5JAGNzXkXge5l0/iW31KEAyWnjUHoT0x9Ca9S6Nq9vq+nQ3ts2UkG47o3dTQSOtS8vD2qMDuLOY/9jV4kr1n7QeI4dD4S1BRh7q4tpEjTyBGCxryZQFFFFAUUUUBRRRQSWmzmNivrmrDb3CiUBAwzVSgI58HoanbOXCqQcNQWSO6LMRygHFFRUVxg55tj59aKCnZrFZII6jFYoCn2nRo9yGdgAni+NMadW9x7tCn3e5I70EzqN6Z5RGCRGgDY82PemYOVzim6NzPlsnmp4HHLjFAZG1ZkKheozWnOCdulJyvyhm64FBGuSzknua0rNYoCiiigltFuPcytiPmPXrXQ+HeMb/h5Z/s6xlJwOYSZZVbsw9a5XDK0Egdfp51NQ38zKFYKqt3z1oJrjDiS51BZGuJmmnutmY9Ao8vIVRqd6hOZ7tznIXwr8BTSgKKKKAooooCiiigypIO1PbaRthnOKZA4NOrckNkHGO1BNRPhQ2cZopKJhyLn1ooIpgGxsT8aSeLuvn0NK96ytA0II67VinzxBxuMjzFN3hZckbigyk2Bhh8xTxCTg9qjKkLVW90C33c7UCqr6UldZSNt+u1OlUc2enwprft4EXOd6Bge1YrJ7VigKKKKApdJcRFSzeHdR5UhRQZrFFFAUUUUBRRRQFFFFAU4gbx9ab0tBnmyKCYh5jGvMoGfKilLc5Rd8bdaKCJIxvWVGe9FFAqmANya25R/mKKKBGS3R9+h7kUqMhQOw6UUUG465yc0zvT+0C56Ciiga0UUUBRRRQFFFFAUUUUBRRRQFFFFAUUUUBS8HUZ86KKCatjsMZNFFFB/9k=',
          css: {
            bottom: '40rpx',
            left: '40rpx',
            borderRadius: '50rpx',
            borderWidth: '10rpx',
            borderColor: 'yellow',
            width: '100rpx',
            height: '100rpx',
          },
        },
        {
          type: 'qrcode',
          content: 'https://github.com/Kujiale-Mobile/Painter',
          css: {
            bottom: '40rpx',
            left: '180rpx',
            color: 'red',
            borderWidth: '10rpx',
            borderColor: 'blue',
            borderStyle: 'dashed',
            width: '120rpx',
            height: '120rpx',
          },
        },
        {
          type: 'rect',
          css: {
            bottom: '40rpx',
            right: '40rpx',
            color: 'radial-gradient(rgba(0, 0, 0, 0) 5%, #0ff 15%, #f0f 60%)',
            borderRadius: '20rpx',
            borderWidth: '10rpx',
            width: '120rpx',
            height: '120rpx',
          },
        },
        {
          type: 'text',
          text: 'borderWidth',
          css: {
            bottom: '40rpx',
            right: '200rpx',
            color: 'green',
            borderWidth: '2rpx',
          },
        },
        {
          type: 'rect',
          css: {
            width: '100rpx',
            height: '100rpx',
            color: 'rgba(0,0,0,0.2)',
            left: '50%',
            top: '50%',
            align: 'center',
            verticalAlign: 'center',
          }
        }
      ],
    });
  }
}

const startTop = 50;
const startLeft = 20;
const gapSize = 70;
const common = {
  left: `${startLeft}rpx`,
  fontSize: '40rpx',
};

function _textDecoration(decoration, index, color) {
  return ({
    type: 'text',
    text: decoration,
    css: [{
      top: `${startTop + index * gapSize}rpx`,
      color: color,
      textDecoration: decoration,
    }, common],
  });
}

function _image(index, rotate, borderRadius) {
  return (
    {
      id: `image-${index}`,
      type: 'image',
      url: '/palette/avatar.jpg',
      css: {
        top: `${startTop + 8.5 * gapSize}rpx`,
        left: `${startLeft + 160 * index}rpx`,
        width: '120rpx',
        height: '120rpx',
        shadow: '10rpx 10rpx 5rpx #888888',
        rotate: rotate,
        minWidth: '60rpx',
        borderRadius: borderRadius,
        scalable: true,
      },
    }
  );
}

function _des(index, content) {
  const des = {
    type: 'text',
    text: content,
    css: {
      fontSize: '22rpx',
      top: `${startTop + 8.5 * gapSize + 140}rpx`,
    },
  };
  if (index === 3) {
    des.css.right = '60rpx';
  } else {
    des.css.left = `${startLeft + 120 * index + 30}rpx`;
  }
  return des;
}
