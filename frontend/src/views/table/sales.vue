<template>
  <div class="app-container">
    <div class="filter-container">
      <el-select v-model="selectedSales.id" placeholder="Sales Number" clearable style="width: 200px">
        <el-option v-for="item in Object.keys(idObject)" :key="item" :label="item" :value="idObject[item]" />
      </el-select>
      <el-input v-model="selectedSales.name" placeholder="Name" style="width: 150px" />
      <el-input v-model="selectedSales.quantity" placeholder="Sales Volume" style="width: 150px" />
      <el-input v-model="selectedSales.revenue" placeholder="Revenue" style="width: 150px" />
      <el-button type="primary" icon="el-icon-search" @click="fetchConditional">
        Search
      </el-button>
      <el-button style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>
    <el-table
      v-loading="listLoading"
      :data="conditionalSales"
      element-loading-text="Loading"
      border
      fit
      highlight-current-row
      style="margin-top: 30px;"
    >
      <el-table-column align="center" label="Sales Number">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="Name">
        <template slot-scope="scope">
          {{ scope.row.name }}
        </template>
      </el-table-column>
      <el-table-column label="Sales Volume" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.quantity }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Revenue" align="center">
        <template slot-scope="scope">
          {{ scope.row.revenue }}
        </template>
      </el-table-column>
    </el-table>

    <el-dialog title="Create" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" label-width="120px">
        <template v-for="(row, index) in formRows">
          <el-row :key="index">
            <el-col :span="10">
              <el-form-item label="Name" prop="name" :label-width="'80px'">
                <el-input v-model="row.name" />
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="Sales Volume" prop="quantity">
                <el-input v-model="row.quantity" />
              </el-form-item>
            </el-col>
            <el-col :span="2" style="margin-left: 10px;">
              <el-button type="text" icon="el-icon-delete-solid" @click="deleteRow(index)" />
            </el-col>
          </el-row>
        </template>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="danger" @click="dialogFormVisible = false">
          Cancel
        </el-button>
        <el-button type="primary" @click="addRow()">
          Add
        </el-button>
        <el-button type="primary" @click="createData()">
          Confirm
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getProduct, getProductByCondition, addProduct } from '@/api/table'

export default {
  data() {
    return {
      formRows: [
        {
          name: '',
          quantity: ''
        }
      ],
      conditionalSales: [],
      category: '',
      listLoading: true,
      selectedSales: {},
      idObject: {},
      dialogFormVisible: false
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
      let newData = data
      let currentId = ''
      let idCount = 0
      if (status === 200) {
        newData = Object.keys(data).flatMap(id => {
          id === currentId ? idCount : idCount++
          currentId = id
          this.idObject[idCount] = id
          return data[id].map((item) => {
            const newItem = {
              id: idCount,
              ...item
            }
            return newItem
          })
        })
        this.conditionalSales = this.conditionalSales.concat(newData)
        if (data.length < 10 || Object.keys(data).length < 10) {
          this.listLoading = false
          return
        }
        await this.fetchProduct(page + 1)
      }
      return
    },
    convertToNumber(str) {
      if (str === undefined || str.trim() === '') {
        return undefined
      }
      const num = parseFloat(str)
      return isNaN(num) ? NaN : num
    },
    async fetchConditional() {
      this.listLoading = true
      const condition = {
        id: this.selectedSales.id || undefined,
        name: this.selectedSales.name || undefined,
        quantity: this.convertToNumber(this.selectedSales.quantity),
        revenue: this.convertToNumber(this.selectedSales.revenue)
      }
      const allPropertiesDefined = Object.values(condition).every((value) => value === undefined)
      this.conditionalSales = []
      if (allPropertiesDefined) {
        this.idObject = []
        await this.fetchProduct(1)
        return
      }
      const [status, data] = await getProductByCondition(this.category, condition)
      let newData = data
      if (status === 200) {
        newData = Object.keys(data).flatMap(id => {
          return data[id].map((item) => {
            const newItem = {
              id: Object.keys(this.idObject).find((key) => this.idObject[key] === id),
              ...item
            }
            return newItem
          })
        })
        this.conditionalSales = this.conditionalSales.concat(newData)
      }
      this.listLoading = false
    },
    resetTemp() {
      this.formRows = [
        {
          name: '',
          quantity: ''
        }
      ]
    },
    addRow() {
      this.formRows.push({
        name: '',
        quantity: ''
      })
    },
    deleteRow(index) {
      if (this.formRows.length === 1) {
        this.$notify({
          title: 'Error',
          message: 'At least one row is required',
          type: 'error',
          duration: 2000
        })
        return
      }
      this.formRows.splice(index, 1)
    },
    handleCreate() {
      this.resetTemp()
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    async createData() {
      this.formRows = this.formRows
        .filter(row => row.name && row.quantity)
        .map(row => ({ ...row, quantity: this.convertToNumber(row.quantity) }))
      const [, res] = await addProduct(this.category, this.formRows)
      if (res !== 'New sales added') {
        this.$notify({
          title: 'Error',
          message: 'Create Failed',
          type: 'error',
          duration: 2000
        })
        this.dialogFormVisible = false
        return
      }
      this.$notify({
        title: 'Success',
        message: 'Create Successfully',
        type: 'success',
        duration: 2000
      })
      this.conditionalSales = []
      await this.fetchProduct(1)
      this.dialogFormVisible = false
    }
  }
}
</script>
