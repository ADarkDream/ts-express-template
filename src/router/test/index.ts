//test路由模块
import express, { Router } from "express"
import { test_main_router, test_aaa_router } from "./test-router"

const router: Router = express.Router()

/**示例/test*/
router.get("/", test_main_router)

/**示例/test/aaa*/
router.get("/aaa", test_aaa_router)

//导出路由
export default router
