//二级路由模块：test
import express, { Router } from "express"
import { routers_test, routers_test_aaa } from "@/controller/test"

const router: Router = express.Router()

/**示例/test*/
router.get("/", routers_test.get)

/**示例/test*/
router.post("/", routers_test.bbb)

/**示例/test/aaa*/
router.get("/aaa", routers_test_aaa.get)

/**示例/test/aaa*/
router.post("/aaa", routers_test_aaa.post)

//导出路由
export default router
