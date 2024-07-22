const express=require("express")
const {apiKey,permission} = require("../auth/checkAuth")
const router=express.Router()

//check apikey
router.use(apiKey)
//check permission
router.use(permission('0000'))

router.use('/v1/api',require('./access'))
router.use('/v1/api/products',require('./product'))
router.use('/v1/api/discount',require('./discount'))



module.exports=router