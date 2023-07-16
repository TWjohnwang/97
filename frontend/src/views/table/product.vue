<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="selectedProduct.name" placeholder="Product Name" clearable style="width: 200px">
        <el-option v-for="item in product" :key="item.name" :label="item.name" :value="item.name" />
      </el-select>
      <el-input v-model="selectedProduct.quantity_sold" placeholder="Sales Volume" style="width: 150px" />
      <el-input v-model="selectedProduct.selling_price" placeholder="Price" style="width: 150px" />
      <el-input v-model="selectedProduct.inventory" placeholder="Inventory" style="width: 150px" />
      <el-button type="primary" icon="el-icon-search" @click="fetchConditional">
        Search
      </el-button>
      <el-button style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="conditionalProduct"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      style="margin-top: 30px;"
    >
      <el-table-column align="center" label="Name" width="250">
        <template slot-scope="{row}">
          {{ row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Sales Volume" width="130" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.quantity_sold }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Price" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.selling_price }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="Inventory" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.inventory }}
        </template>
      </el-table-column>
      <el-table-column label="Note" align="center">
        <template slot-scope="scope">
          {{ scope.row.note }}
        </template>
      </el-table-column>
      <el-table-column label="Actions" align="center" class-name="small-padding fixed-width">
        <template slot-scope="{row, $index}">
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Edit
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row.name, $index)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="150px" style="width: 400px; margin-left:5%;">
        <el-form-item label="Name" prop="newName">
          <el-input v-model="temp.newName" />
        </el-form-item>
        <el-form-item label="Sales Volume" prop="quantity_sold">
          <el-input v-model="temp.quantity_sold" />
        </el-form-item>
        <el-form-item label="Price" prop="selling_price">
          <el-input v-model="temp.selling_price" />
        </el-form-item>
        <el-form-item label="Inventory" prop="inventory">
          <el-input v-model="temp.inventory" />
        </el-form-item>
        <el-form-item label="Note">
          <el-input v-model="temp.note" :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="Please input" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>``
import { getProduct, getProductByCondition, addProduct, updateProduct, deleteProduct } from '@/api/table'

export default {
  data() {
    return {
      product: [],
      conditionalProduct: [],
      category: '',
      listLoading: true,
      selectedProduct: {},
      temp: {
        name: '',
        newName: '',
        quantity_sold: '',
        selling_price: '',
        inventory: '',
        note: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      rules: {
        newName: [{ required: true, message: 'Name is required', trigger: 'blur' }],
        quantity_sold: [{ required: true, message: 'Sales Volume is required', trigger: 'blur' }],
        selling_price: [{ required: true, message: 'Price is required', trigger: 'blur' }],
        inventory: [{ required: true, message: 'Inventory is required', trigger: 'blur' }]
      }
    }
  },
  created() {
    const pathSegments = this.$route.matched[0].path.split('/')
    this.category = pathSegments[1]
    this.fetchProduct(1)
  },
  methods: {
    async fetchProduct(page) {
      this.listLoading = true
      const [status, data] = await getProduct(this.category, page)
      if (status === 200) {
        this.product = this.product.concat(data)
        this.conditionalProduct = this.conditionalProduct.concat(data)
        if (data.length < 10 || Object.keys(data).length < 10) {
          this.listLoading = false
          return
        }
        await this.fetchProduct(page + 1)
      }
      this.listLoading = false
      return
    },
    convertToNumber(str) {
      if (typeof str === 'number') {
        return str
      }
      if (str === undefined || str.trim() === '') {
        return undefined
      }
      const num = parseFloat(str)
      return isNaN(num) ? NaN : num
    },
    async fetchConditional() {
      this.listLoading = true
      const condition = {
        name: this.selectedProduct.name || undefined,
        quantity_sold: this.convertToNumber(this.selectedProduct.quantity_sold),
        selling_price: this.convertToNumber(this.selectedProduct.selling_price),
        inventory: this.convertToNumber(this.selectedProduct.inventory)
      }
      const allPropertiesDefined = Object.values(condition).every((value) => value === undefined)
      if (allPropertiesDefined) {
        this.product = []
        this.conditionalProduct = []
        await this.fetchProduct(1)
        return
      }
      const [, data] = await getProductByCondition(this.category, condition)
      this.conditionalProduct = data
      this.listLoading = false
    },
    resetTemp() {
      this.temp = {
        name: '',
        newName: '',
        quantity_sold: '',
        selling_price: '',
        inventory: '',
        note: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          const req = {
            name: this.temp.newName,
            quantity_sold: this.convertToNumber(this.temp.quantity_sold),
            selling_price: this.convertToNumber(this.temp.selling_price),
            inventory: this.convertToNumber(this.temp.inventory),
            note: this.temp.note
          }
          const [, res] = await addProduct(this.category, req)
          if (res !== 'Data added successfully') {
            this.$notify({
              title: 'Error',
              message: 'Create Failed',
              type: 'error',
              duration: 2000
            })
            return
          }
          const tempData = Object.assign({}, this.temp)
          tempData.name = this.temp.newName
          this.product.unshift(tempData)
          this.conditionalProduct.unshift(tempData)
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Created Successfully',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    handleUpdate(row) {
      row.newName = row.name
      this.temp = Object.assign({}, row) // copy obj
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async updateData() {
      this.$refs['dataForm'].validate(async(valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.quantity_sold = this.convertToNumber(this.temp.quantity_sold)
          tempData.selling_price = this.convertToNumber(this.temp.selling_price)
          tempData.inventory = this.convertToNumber(this.temp.inventory)
          const [, result] = await updateProduct(this.category, tempData)
          if (result !== 'Data updated successfully') {
            this.$notify({
              title: 'Error',
              message: 'Update Failed',
              type: 'error',
              duration: 2000
            })
            return
          }
          const index = this.conditionalProduct.findIndex(v => v.name === this.temp.name)
          tempData.name = this.temp.newName
          this.conditionalProduct.splice(index, 1, tempData)
          this.dialogFormVisible = false
          this.$notify({
            title: 'Success',
            message: 'Update Successfully',
            type: 'success',
            duration: 2000
          })
        }
      })
    },
    async handleDelete(name, index) {
      this.listLoading = true
      const [, result] = await deleteProduct(this.category, { name })
      if (result !== 'Data deleted successfully') {
        this.$notify({
          title: 'Error',
          message: 'Delete Failed',
          type: 'error',
          duration: 2000
        })
        this.listLoading = false
        return
      }
      this.$notify({
        title: 'Success',
        message: 'Delete Successfully',
        type: 'success',
        duration: 2000
      })
      this.conditionalProduct.splice(index, 1)
      const productIndex = this.product.findIndex(v => v.name === name)
      this.product.splice(productIndex, 1)
      this.listLoading = false
      return
    }
  }
}
</script>
