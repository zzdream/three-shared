/**
 * earcut 类型声明
 */
declare module 'earcut' {
	/**
	 * 将多边形顶点数组转换为三角形索引数组
	 * @param vertices 顶点数组，格式为 [x1, y1, x2, y2, ..., xn, yn]
	 * @param holes 孔洞索引数组（可选）
	 * @param dimensions 维度，默认为 2
	 * @returns 三角形索引数组
	 */
	function earcut(vertices: number[], holes?: number[], dimensions?: number): number[]
	export default earcut
}

